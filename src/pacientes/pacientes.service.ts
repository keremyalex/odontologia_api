import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Paciente } from '../entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
    constructor(
        @InjectRepository(Paciente)
        private pacienteRepository: Repository<Paciente>,
    ) { }

    async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
        const pacienteData: any = { ...createPacienteDto };

        if (createPacienteDto.fechaNac) {
            pacienteData.fechaNac = new Date(createPacienteDto.fechaNac);
        }

        const paciente = this.pacienteRepository.create(pacienteData);
        const savedPaciente = await this.pacienteRepository.save(paciente);
        return Array.isArray(savedPaciente) ? savedPaciente[0] : savedPaciente;
    }

    async findAll(search?: string): Promise<Paciente[]> {
        if (search) {
            return this.pacienteRepository.find({
                where: [
                    { nombre: Like(`%${search}%`) },
                    { apellido: Like(`%${search}%`) },
                    { ci: Like(`%${search}%`) },
                    { email: Like(`%${search}%`) },
                ],
                order: { fechaRegistro: 'DESC' },
            });
        }

        return this.pacienteRepository.find({
            order: { fechaRegistro: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Paciente> {
        const paciente = await this.pacienteRepository.findOne({
            where: { id },
            relations: ['turnos'],
        });

        if (!paciente) {
            throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
        }

        return paciente;
    }

    async update(id: number, updatePacienteDto: UpdatePacienteDto): Promise<Paciente> {
        const paciente = await this.findOne(id);
        const updateData: any = { ...updatePacienteDto };

        if (updateData.fechaNac) {
            updateData.fechaNac = new Date(updateData.fechaNac);
        }

        Object.assign(paciente, updateData);

        const savedPaciente = await this.pacienteRepository.save(paciente);
        return Array.isArray(savedPaciente) ? savedPaciente[0] : savedPaciente;
    }

    async remove(id: number): Promise<void> {
        const paciente = await this.findOne(id);
        await this.pacienteRepository.remove(paciente);
    }
}