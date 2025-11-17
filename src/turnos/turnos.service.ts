import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno, TurnoEstado } from '../entities/turno.entity';
import { Paciente } from '../entities/paciente.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@Injectable()
export class TurnosService {
    constructor(
        @InjectRepository(Turno)
        private turnoRepository: Repository<Turno>,
        @InjectRepository(Paciente)
        private pacienteRepository: Repository<Paciente>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createTurnoDto: CreateTurnoDto): Promise<Turno> {
        const fechaInicio = new Date(createTurnoDto.fechaInicio);
        const fechaFin = new Date(createTurnoDto.fechaFin);

        // Validar que fecha_fin > fecha_inicio
        if (fechaFin <= fechaInicio) {
            throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }

        // Validar que el paciente existe
        const paciente = await this.pacienteRepository.findOne({
            where: { id: createTurnoDto.pacienteId }
        });
        if (!paciente) {
            throw new NotFoundException(`Paciente con ID ${createTurnoDto.pacienteId} no encontrado`);
        }

        // Validar que el estudiante existe si se proporciona
        if (createTurnoDto.estudianteId) {
            const estudiante = await this.userRepository.findOne({
                where: { id: createTurnoDto.estudianteId, rol: UserRole.ESTUDIANTE }
            });
            if (!estudiante) {
                throw new NotFoundException(`Estudiante con ID ${createTurnoDto.estudianteId} no encontrado`);
            }
        }

        // Validar que el supervisor existe si se proporciona
        if (createTurnoDto.supervisorId) {
            const supervisor = await this.userRepository.findOne({
                where: { id: createTurnoDto.supervisorId, rol: UserRole.DOCENTE }
            });
            if (!supervisor) {
                throw new NotFoundException(`Supervisor con ID ${createTurnoDto.supervisorId} no encontrado`);
            }
        }

        // Verificar solapamiento por estudiante
        if (createTurnoDto.estudianteId) {
            await this.validateNoOverlap(fechaInicio, fechaFin, createTurnoDto.estudianteId, 'estudiante');
        }

        // Verificar solapamiento por consultorio
        if (createTurnoDto.consultorio) {
            await this.validateNoConsultorioOverlap(fechaInicio, fechaFin, createTurnoDto.consultorio);
        }

        const turnoData: any = {
            ...createTurnoDto,
            fechaInicio,
            fechaFin,
        };

        const turno = this.turnoRepository.create(turnoData);
        const savedTurno = await this.turnoRepository.save(turno);
        return Array.isArray(savedTurno) ? savedTurno[0] : savedTurno;
    }

    private async validateNoOverlap(
        fechaInicio: Date,
        fechaFin: Date,
        userId: number,
        userType: 'estudiante' | 'supervisor',
        excludeTurnoId?: number
    ): Promise<void> {
        const whereCondition: any = {
            [userType === 'estudiante' ? 'estudianteId' : 'supervisorId']: userId,
            estado: 'confirmado'
        };

        if (excludeTurnoId) {
            whereCondition.id = `NOT ${excludeTurnoId}`;
        }

        const overlappingTurnos = await this.turnoRepository
            .createQueryBuilder('turno')
            .where(userType === 'estudiante' ? 'turno.estudiante_id = :userId' : 'turno.supervisor_id = :userId', { userId })
            .andWhere('turno.estado = :estado', { estado: 'confirmado' })
            .andWhere(
                '(turno.fecha_inicio < :fechaFin AND turno.fecha_fin > :fechaInicio)',
                { fechaInicio, fechaFin }
            )
            .andWhere(excludeTurnoId ? 'turno.id != :excludeId' : '1=1', { excludeId: excludeTurnoId })
            .getMany();

        if (overlappingTurnos.length > 0) {
            throw new ConflictException(`El ${userType} ya tiene un turno confirmado en ese horario`);
        }
    }

    private async validateNoConsultorioOverlap(
        fechaInicio: Date,
        fechaFin: Date,
        consultorio: string,
        excludeTurnoId?: number
    ): Promise<void> {
        const overlappingTurnos = await this.turnoRepository
            .createQueryBuilder('turno')
            .where('turno.consultorio = :consultorio', { consultorio })
            .andWhere('turno.estado = :estado', { estado: 'confirmado' })
            .andWhere(
                '(turno.fecha_inicio < :fechaFin AND turno.fecha_fin > :fechaInicio)',
                { fechaInicio, fechaFin }
            )
            .andWhere(excludeTurnoId ? 'turno.id != :excludeId' : '1=1', { excludeId: excludeTurnoId })
            .getMany();

        if (overlappingTurnos.length > 0) {
            throw new ConflictException(`El consultorio ${consultorio} ya está ocupado en ese horario`);
        }
    }

    async findAll(): Promise<Turno[]> {
        return this.turnoRepository.find({
            relations: ['paciente', 'estudiante', 'supervisor'],
            order: { fechaInicio: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Turno> {
        const turno = await this.turnoRepository.findOne({
            where: { id },
            relations: ['paciente', 'estudiante', 'supervisor'],
        });

        if (!turno) {
            throw new NotFoundException(`Turno con ID ${id} no encontrado`);
        }

        return turno;
    }

    async update(id: number, updateTurnoDto: UpdateTurnoDto): Promise<Turno> {
        const turno = await this.findOne(id);

        const updateData: any = { ...updateTurnoDto };

        if (updateData.fechaInicio) {
            updateData.fechaInicio = new Date(updateData.fechaInicio);
        }

        if (updateData.fechaFin) {
            updateData.fechaFin = new Date(updateData.fechaFin);
        }

        // Validar fechas si se están actualizando
        const fechaInicio = updateData.fechaInicio || turno.fechaInicio;
        const fechaFin = updateData.fechaFin || turno.fechaFin;

        if (fechaFin <= fechaInicio) {
            throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }

        // Validar solapamientos si se cambian fechas, estudiante o consultorio
        if (updateData.fechaInicio || updateData.fechaFin || updateData.estudianteId !== undefined) {
            const estudianteId = updateData.estudianteId !== undefined ? updateData.estudianteId : turno.estudianteId;
            if (estudianteId) {
                await this.validateNoOverlap(fechaInicio, fechaFin, estudianteId, 'estudiante', id);
            }
        }

        if (updateData.fechaInicio || updateData.fechaFin || updateData.consultorio !== undefined) {
            const consultorio = updateData.consultorio !== undefined ? updateData.consultorio : turno.consultorio;
            if (consultorio) {
                await this.validateNoConsultorioOverlap(fechaInicio, fechaFin, consultorio, id);
            }
        }

        Object.assign(turno, updateData);
        const savedTurno = await this.turnoRepository.save(turno);
        return Array.isArray(savedTurno) ? savedTurno[0] : savedTurno;
    }

    async checkin(id: number): Promise<Turno> {
        const turno = await this.findOne(id);

        if (turno.estado === TurnoEstado.ATENDIDO) {
            throw new BadRequestException('El turno ya ha sido atendido');
        }

        if (turno.estado === TurnoEstado.CANCELADO) {
            throw new BadRequestException('No se puede hacer check-in en un turno cancelado');
        }

        turno.estado = TurnoEstado.ATENDIDO;
        const savedTurno = await this.turnoRepository.save(turno);
        return Array.isArray(savedTurno) ? savedTurno[0] : savedTurno;
    }

    async remove(id: number): Promise<void> {
        const turno = await this.findOne(id);
        await this.turnoRepository.remove(turno);
    }
}