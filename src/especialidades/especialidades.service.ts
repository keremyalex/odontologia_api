import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from '../entities/especialidad.entity';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';

@Injectable()
export class EspecialidadesService {
  constructor(
    @InjectRepository(Especialidad)
    private especialidadRepository: Repository<Especialidad>,
  ) {}

  async create(createEspecialidadDto: CreateEspecialidadDto): Promise<Especialidad> {
    // Verificar que no exista una especialidad con el mismo nombre
    const especialidadExistente = await this.especialidadRepository.findOne({
      where: { nombre: createEspecialidadDto.nombre }
    });

    if (especialidadExistente) {
      throw new ConflictException(`Ya existe una especialidad con el nombre '${createEspecialidadDto.nombre}'`);
    }

    const especialidad = this.especialidadRepository.create(createEspecialidadDto);
    return await this.especialidadRepository.save(especialidad);
  }

  async findAll(): Promise<Especialidad[]> {
    return await this.especialidadRepository.find({
      relations: ['franjasHorarias'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Especialidad> {
    const especialidad = await this.especialidadRepository.findOne({
      where: { id },
      relations: ['franjasHorarias', 'franjasHorarias.responsable']
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }

    return especialidad;
  }

  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto): Promise<Especialidad> {
    const especialidad = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateEspecialidadDto.nombre && updateEspecialidadDto.nombre !== especialidad.nombre) {
      const especialidadExistente = await this.especialidadRepository.findOne({
        where: { nombre: updateEspecialidadDto.nombre }
      });

      if (especialidadExistente) {
        throw new ConflictException(`Ya existe una especialidad con el nombre '${updateEspecialidadDto.nombre}'`);
      }
    }

    Object.assign(especialidad, updateEspecialidadDto);
    return await this.especialidadRepository.save(especialidad);
  }

  async remove(id: number): Promise<void> {
    const especialidad = await this.findOne(id);
    
    // Verificar si tiene franjas horarias asociadas
    if (especialidad.franjasHorarias && especialidad.franjasHorarias.length > 0) {
      throw new ConflictException('No se puede eliminar la especialidad porque tiene franjas horarias asociadas');
    }

    await this.especialidadRepository.remove(especialidad);
  }

  async findByName(nombre: string): Promise<Especialidad | null> {
    return await this.especialidadRepository.findOne({
      where: { nombre },
      relations: ['franjasHorarias']
    });
  }
}
