import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Odontograma } from '../entities/odontograma.entity';
import { CreateOdontogramaDto } from './dto/create-odontograma.dto';
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
      ...createOdontogramaDto,
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
    const odontograma = await this.odontogramaRepository.findOne({
      where: { historiaId },
      relations: ['historia', 'creador'],
      order: { version: 'DESC' },
    });

    if (!odontograma) {
      throw new NotFoundException(`No se encontró odontograma para la historia ${historiaId}`);
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
}