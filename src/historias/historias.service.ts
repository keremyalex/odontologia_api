import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historia } from '../entities/historia.entity';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class HistoriasService {
  constructor(
    @InjectRepository(Historia)
    private historiaRepository: Repository<Historia>,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createHistoriaDto: CreateHistoriaDto, usuarioId: number): Promise<Historia> {
    const historia = this.historiaRepository.create({
      ...createHistoriaDto,
      creadoPor: usuarioId,
    });

    const savedHistoria = await this.historiaRepository.save(historia);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      Array.isArray(savedHistoria) ? savedHistoria[0].id : savedHistoria.id,
      AccionAuditoria.INSERT,
      null,
      savedHistoria,
      usuarioId,
    );

    return this.findOne(Array.isArray(savedHistoria) ? savedHistoria[0].id : savedHistoria.id);
  }

  async findAll(): Promise<Historia[]> {
    return this.historiaRepository.find({
      relations: ['paciente', 'creador'],
    });
  }

  async findByPaciente(pacienteId: number): Promise<Historia[]> {
    return this.historiaRepository.find({
      where: { pacienteId },
      relations: ['paciente', 'creador'],
      order: { creadoAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Historia> {
    const historia = await this.historiaRepository.findOne({
      where: { id },
      relations: ['paciente', 'creador'],
    });

    if (!historia) {
      throw new NotFoundException(`Historia clínica con ID ${id} no encontrada`);
    }

    return historia;
  }

  async update(id: number, updateHistoriaDto: UpdateHistoriaDto, usuarioId: number): Promise<Historia> {
    const historiaAnterior = await this.findOne(id);
    
    // TypeORM no puede manejar directamente objetos complejos en update
    // Usamos merge para crear la entidad completa y save para actualizar
    const historiaActualizada = this.historiaRepository.merge(historiaAnterior, {
      ...updateHistoriaDto,
      creadoPor: usuarioId, // Actualizamos quien modificó
    });

    const historiaNueva = await this.historiaRepository.save(historiaActualizada);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      id,
      AccionAuditoria.UPDATE,
      historiaAnterior,
      historiaNueva,
      usuarioId,
    );

    return historiaNueva;
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const historia = await this.findOne(id);
    
    await this.historiaRepository.remove(historia);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'historias',
      id,
      AccionAuditoria.DELETE,
      historia,
      null,
      usuarioId,
    );
  }
}