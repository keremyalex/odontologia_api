import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Atencion } from '../entities/atencion.entity';
import { Cita, CitaEstado } from '../entities/cita.entity';
import { Historia } from '../entities/historia.entity';
import { CreateAtencionDto, UpdateAtencionDto } from './dto/create-atencion.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class AtencionesService {
  constructor(
    @InjectRepository(Atencion)
    private atencionRepository: Repository<Atencion>,
    
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
    
    @InjectRepository(Historia)
    private historiaRepository: Repository<Historia>,
    
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createAtencionDto: CreateAtencionDto, usuarioId: number): Promise<Atencion> {
    // Verificar que la cita existe y está en estado PROGRAMADA
    const cita = await this.citaRepository.findOne({
      where: { id: createAtencionDto.citaId },
      relations: ['paciente', 'franja']
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (cita.estado !== CitaEstado.PROGRAMADA) {
      throw new BadRequestException('Solo se pueden atender citas en estado PROGRAMADA');
    }

    // Verificar que no existe una atención previa para esta cita
    const atencionExistente = await this.atencionRepository.findOne({
      where: { citaId: createAtencionDto.citaId }
    });

    if (atencionExistente) {
      throw new BadRequestException('Esta cita ya ha sido atendida');
    }

    // Obtener la historia clínica del paciente
    const historia = await this.historiaRepository.findOne({
      where: { pacienteId: cita.paciente.id },
      order: { creadoAt: 'DESC' } // Obtener la más reciente
    });

    if (!historia) {
      throw new BadRequestException('No se encontró historia clínica para este paciente');
    }

    // Crear la atención
    const atencion = this.atencionRepository.create({
      citaId: createAtencionDto.citaId,
      historiaId: historia.id,
      diagnosticoPresuntivo: createAtencionDto.diagnosticoPresuntivo,
      planTratamiento: createAtencionDto.planTratamiento,
      observaciones: createAtencionDto.observaciones,
      estadoBucalGeneral: {
        presenciaSarro: createAtencionDto.estadoBucalGeneral.presenciaSarro,
        enfermedadPeriodontal: createAtencionDto.estadoBucalGeneral.enfermedadPeriodontal,
        higieneBucal: createAtencionDto.estadoBucalGeneral.higieneBucal as 'muy_bueno' | 'bueno' | 'deficiente' | 'malo',
        otros: createAtencionDto.estadoBucalGeneral.otros || '',
      },
      atendidoPor: usuarioId,
    });

    const savedAtencion = await this.atencionRepository.save(atencion);

    // Actualizar el estado de la cita a ATENDIDA
    await this.citaRepository.update(cita.id, { 
      estado: CitaEstado.ATENDIDA 
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'atenciones',
      savedAtencion.id,
      AccionAuditoria.INSERT,
      null,
      savedAtencion,
      usuarioId,
    );

    return this.findOne(savedAtencion.id);
  }

  async findAll(): Promise<Atencion[]> {
    return this.atencionRepository.find({
      relations: ['cita', 'cita.paciente', 'cita.franja', 'historia', 'atencionPor'],
      order: { fechaAtencion: 'DESC' },
    });
  }

  async findByPaciente(pacienteId: number): Promise<Atencion[]> {
    return this.atencionRepository
      .createQueryBuilder('atencion')
      .leftJoinAndSelect('atencion.cita', 'cita')
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('atencion.historia', 'historia')
      .leftJoinAndSelect('atencion.atencionPor', 'atencionPor')
      .where('paciente.id = :pacienteId', { pacienteId })
      .orderBy('atencion.fechaAtencion', 'DESC')
      .getMany();
  }

  async findByHistoria(historiaId: number): Promise<Atencion[]> {
    return this.atencionRepository.find({
      where: { historiaId },
      relations: ['cita', 'cita.paciente', 'atencionPor'],
      order: { fechaAtencion: 'DESC' },
    });
  }

  async findByCita(citaId: number): Promise<Atencion> {
    const atencion = await this.atencionRepository.findOne({
      where: { citaId },
      relations: ['cita', 'cita.paciente', 'cita.franja', 'historia', 'atencionPor'],
    });

    if (!atencion) {
      throw new NotFoundException('No se encontró atención para esta cita');
    }

    return atencion;
  }

  async findByDocenteEstudiante(usuarioId: number): Promise<Atencion[]> {
    return this.atencionRepository.find({
      where: { atendidoPor: usuarioId },
      relations: ['cita', 'cita.paciente', 'cita.franja', 'historia'],
      order: { fechaAtencion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Atencion> {
    const atencion = await this.atencionRepository.findOne({
      where: { id },
      relations: ['cita', 'cita.paciente', 'cita.franja', 'historia', 'atencionPor'],
    });

    if (!atencion) {
      throw new NotFoundException(`Atención con ID ${id} no encontrada`);
    }

    return atencion;
  }

  async update(id: number, updateAtencionDto: UpdateAtencionDto, usuarioId: number): Promise<Atencion> {
    const atencionAnterior = await this.findOne(id);

    // Verificar que el usuario que intenta actualizar es quien atendió originalmente o es admin/docente
    if (atencionAnterior.atendidoPor !== usuarioId) {
      // Aquí podrías agregar lógica adicional para permitir que docentes modifiquen atenciones de estudiantes
      throw new ForbiddenException('Solo puedes modificar tus propias atenciones');
    }

    const datosActualizacion: Partial<Atencion> = {
      actualizadoAt: new Date(),
    };

    if (updateAtencionDto.diagnosticoPresuntivo !== undefined) {
      datosActualizacion.diagnosticoPresuntivo = updateAtencionDto.diagnosticoPresuntivo;
    }
    if (updateAtencionDto.planTratamiento !== undefined) {
      datosActualizacion.planTratamiento = updateAtencionDto.planTratamiento;
    }
    if (updateAtencionDto.observaciones !== undefined) {
      datosActualizacion.observaciones = updateAtencionDto.observaciones;
    }
    if (updateAtencionDto.estadoBucalGeneral !== undefined) {
      datosActualizacion.estadoBucalGeneral = {
        presenciaSarro: updateAtencionDto.estadoBucalGeneral.presenciaSarro,
        enfermedadPeriodontal: updateAtencionDto.estadoBucalGeneral.enfermedadPeriodontal,
        higieneBucal: updateAtencionDto.estadoBucalGeneral.higieneBucal as 'muy_bueno' | 'bueno' | 'deficiente' | 'malo',
        otros: updateAtencionDto.estadoBucalGeneral.otros || '',
      };
    }

    const atencionActualizada = this.atencionRepository.merge(atencionAnterior, datosActualizacion);

    const atencionNueva = await this.atencionRepository.save(atencionActualizada);

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'atenciones',
      id,
      AccionAuditoria.UPDATE,
      atencionAnterior,
      atencionNueva,
      usuarioId,
    );

    return atencionNueva;
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const atencion = await this.findOne(id);

    // Verificar permisos (solo admin o quien atendió puede eliminar)
    if (atencion.atendidoPor !== usuarioId) {
      throw new ForbiddenException('Solo puedes eliminar tus propias atenciones');
    }

    // Cambiar el estado de la cita de vuelta a PROGRAMADA
    await this.citaRepository.update(atencion.citaId, { 
      estado: CitaEstado.PROGRAMADA 
    });

    await this.atencionRepository.remove(atencion);

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'atenciones',
      id,
      AccionAuditoria.DELETE,
      atencion,
      null,
      usuarioId,
    );
  }

  // Obtener estadísticas de atenciones
  async getEstadisticas(): Promise<any> {
    const totalAtenciones = await this.atencionRepository.count();
    
    const atencionesHoy = await this.atencionRepository
      .createQueryBuilder('atencion')
      .where('DATE(atencion.fechaAtencion) = CURRENT_DATE')
      .getCount();

    const atencionesSemana = await this.atencionRepository
      .createQueryBuilder('atencion')
      .where('atencion.fechaAtencion >= CURRENT_DATE - INTERVAL \'7 days\'')
      .getCount();

    const atencionesEsteMes = await this.atencionRepository
      .createQueryBuilder('atencion')
      .where('EXTRACT(MONTH FROM atencion.fechaAtencion) = EXTRACT(MONTH FROM CURRENT_DATE)')
      .andWhere('EXTRACT(YEAR FROM atencion.fechaAtencion) = EXTRACT(YEAR FROM CURRENT_DATE)')
      .getCount();

    return {
      totalAtenciones,
      atencionesHoy,
      atencionesSemana,
      atencionesEsteMes
    };
  }
}