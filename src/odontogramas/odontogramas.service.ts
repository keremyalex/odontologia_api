import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Odontograma } from '../entities/odontograma.entity';
import { CreateOdontogramaDto, UpdateOdontogramaObservacionesDto } from './dto/create-odontograma.dto';
import { UpdateOdontogramaDto } from './dto/update-odontograma.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class OdontogramasService {
  constructor(
    @InjectRepository(Odontograma)
    private odontogramaRepository: Repository<Odontograma>,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createOdontogramaDto: CreateOdontogramaDto, usuarioId: number): Promise<Odontograma> {
    // Validar estructura de dientes
    this.validarEstructuraDientes(createOdontogramaDto.dientes);

    // Obtener la versión máxima para esta historia
    const maxVersion = await this.odontogramaRepository
      .createQueryBuilder('odontograma')
      .select('MAX(odontograma.version)', 'max')
      .where('odontograma.historiaId = :historiaId', { 
        historiaId: createOdontogramaDto.historiaId 
      })
      .getRawOne();

    const nextVersion = (maxVersion?.max || 0) + 1;

    const odontograma = this.odontogramaRepository.create({
      historiaId: createOdontogramaDto.historiaId,
      fecha: createOdontogramaDto.fecha,
      dientes: createOdontogramaDto.dientes,
      observaciones: createOdontogramaDto.observaciones,
      version: nextVersion,
      creadoPor: usuarioId,
    });

    const savedOdontograma = await this.odontogramaRepository.save(odontograma);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'odontogramas',
      Array.isArray(savedOdontograma) ? savedOdontograma[0].id : savedOdontograma.id,
      AccionAuditoria.INSERT,
      null,
      savedOdontograma,
      usuarioId,
    );

    return this.findOne(Array.isArray(savedOdontograma) ? savedOdontograma[0].id : savedOdontograma.id);
  }

  async findAll(): Promise<Odontograma[]> {
    return this.odontogramaRepository.find({
      relations: ['historia', 'creador'],
      order: { creadoAt: 'DESC', version: 'DESC' },
    });
  }

  async findByHistoria(historiaId: number): Promise<Odontograma[]> {
    return this.odontogramaRepository.find({
      where: { historiaId },
      relations: ['historia', 'creador'],
      order: { version: 'DESC' },
    });
  }

  async findLatestByHistoria(historiaId: number): Promise<Odontograma> {
    let odontograma = await this.odontogramaRepository.findOne({
      where: { historiaId },
      relations: ['historia', 'creador'],
      order: { version: 'DESC' },
    });

    // Si no existe odontograma, crear uno inicial
    if (!odontograma) {
      const dientesIniciales = Odontograma.generarDientesIniciales();
      const createDto: CreateOdontogramaDto = {
        historiaId,
        fecha: new Date().toISOString().split('T')[0],
        dientes: dientesIniciales,
        observaciones: 'Odontograma inicial - todos los dientes sanos'
      };
      
      odontograma = await this.create(createDto, 1); // Sistema como creador
    }

    return odontograma;
  }

  async findOne(id: number): Promise<Odontograma> {
    const odontograma = await this.odontogramaRepository.findOne({
      where: { id },
      relations: ['historia', 'creador'],
    });

    if (!odontograma) {
      throw new NotFoundException(`Odontograma con ID ${id} no encontrado`);
    }

    return odontograma;
  }

  async update(id: number, updateOdontogramaDto: UpdateOdontogramaDto, usuarioId: number): Promise<Odontograma> {
    const odontogramaAnterior = await this.findOne(id);
    
    // Solo permitir actualizar observaciones, no los datos del odontograma
    // Para cambios en los datos, se debe crear una nueva versión
    const odontogramaActualizado = this.odontogramaRepository.merge(odontogramaAnterior, {
      observaciones: updateOdontogramaDto.observaciones,
    });

    const odontogramaNuevo = await this.odontogramaRepository.save(odontogramaActualizado);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'odontogramas',
      id,
      AccionAuditoria.UPDATE,
      odontogramaAnterior,
      odontogramaNuevo,
      usuarioId,
    );

    return odontogramaNuevo;
  }

  async updateObservaciones(id: number, updateDto: UpdateOdontogramaObservacionesDto, usuarioId: number): Promise<Odontograma> {
    const odontogramaAnterior = await this.findOne(id);
    
    const odontogramaActualizado = this.odontogramaRepository.merge(odontogramaAnterior, {
      observaciones: updateDto.observaciones,
    });

    const odontogramaNuevo = await this.odontogramaRepository.save(odontogramaActualizado);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'odontogramas',
      id,
      AccionAuditoria.UPDATE,
      odontogramaAnterior,
      odontogramaNuevo,
      usuarioId,
    );

    return odontogramaNuevo;
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const odontograma = await this.findOne(id);
    
    await this.odontogramaRepository.remove(odontograma);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'odontogramas',
      id,
      AccionAuditoria.DELETE,
      odontograma,
      null,
      usuarioId,
    );
  }

  // Validar estructura de datos de dientes
  private validarEstructuraDientes(dientes: any[]): void {
    if (!Array.isArray(dientes) || dientes.length !== 32) {
      throw new BadRequestException('Debe incluir exactamente 32 dientes');
    }

    const estadosValidos = [
      'sano', 'caries', 'obturado', 'corona', 'endodoncia', 
      'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'
    ];

    const numerosEsperados = [
      '1.8', '1.7', '1.6', '1.5', '1.4', '1.3', '1.2', '1.1',
      '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8',
      '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8',
      '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8'
    ];

    for (const diente of dientes) {
      // Validar estructura básica
      if (!diente.id || !diente.number || !diente.status || !diente.surfaces) {
        throw new BadRequestException('Estructura de diente inválida');
      }

      // Validar número FDI
      if (!numerosEsperados.includes(diente.number)) {
        throw new BadRequestException(`Número de diente inválido: ${diente.number}`);
      }

      // Validar estado general
      if (!estadosValidos.includes(diente.status)) {
        throw new BadRequestException(`Estado de diente inválido: ${diente.status}`);
      }

      // Validar superficies
      const superficies = ['vestibular', 'oclusal', 'distal', 'lingual', 'mesial'];
      for (const superficie of superficies) {
        if (!diente.surfaces[superficie] || !estadosValidos.includes(diente.surfaces[superficie])) {
          throw new BadRequestException(`Estado de superficie inválido: ${superficie}`);
        }
      }
    }
  }

  // Obtener estadísticas del odontograma
  async obtenerEstadisticas(historiaId: number): Promise<any> {
    const odontograma = await this.findLatestByHistoria(historiaId);
    const dientes = odontograma.getDientes();

    const estadisticas = {
      totalDientes: dientes.length,
      sanos: 0,
      conCaries: 0,
      obturados: 0,
      extraidos: 0,
      conTratamiento: 0,
      porSuperficie: {
        vestibular: {},
        oclusal: {},
        distal: {},
        lingual: {},
        mesial: {}
      }
    };

    for (const diente of dientes) {
      // Estadísticas generales
      switch (diente.status) {
        case 'sano':
          estadisticas.sanos++;
          break;
        case 'caries':
          estadisticas.conCaries++;
          break;
        case 'obturado':
          estadisticas.obturados++;
          break;
        case 'extraido':
          estadisticas.extraidos++;
          break;
        default:
          estadisticas.conTratamiento++;
      }

      // Estadísticas por superficie
      for (const [superficie, estado] of Object.entries(diente.surfaces)) {
        if (!estadisticas.porSuperficie[superficie][estado]) {
          estadisticas.porSuperficie[superficie][estado] = 0;
        }
        estadisticas.porSuperficie[superficie][estado]++;
      }
    }

    return estadisticas;
  }
}