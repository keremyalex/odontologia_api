import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index, Check } from 'typeorm';
import { Paciente } from './paciente.entity';
import { FranjaHoraria } from './franja-horaria.entity';

export enum CitaEstado {
    PROGRAMADA = 'programada',
    ATENDIDA = 'atendida',
    CANCELADA = 'cancelada',
    NO_ASISTIO = 'no_asistio',
    REPROGRAMADA = 'reprogramada'
}

@Entity('citas')
@Index('idx_cita_fecha_franja', ['fecha', 'franjaId'])
@Index('idx_cita_paciente_fecha', ['pacienteId', 'fecha'])
export class Cita {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', name: 'id_paciente' })
    pacienteId: number;

    @Column({ type: 'int', name: 'id_franja' })
    franjaId: number;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'time', name: 'hora_inicio' })
    horaInicio: string;

    @Column({ type: 'time', name: 'hora_fin' })
    horaFin: string;

    @Column({ type: 'enum', enum: CitaEstado, default: CitaEstado.PROGRAMADA })
    estado: CitaEstado;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ type: 'text', nullable: true, name: 'motivo_consulta' })
    motivoConsulta: string;

    @Column({ type: 'int', nullable: true, name: 'creado_por' })
    creadoPor: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    // Relaciones
    @ManyToOne(() => Paciente, paciente => paciente.citas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_paciente' })
    paciente: Paciente;

    @ManyToOne(() => FranjaHoraria, franja => franja.citas, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'id_franja' })
    franja: FranjaHoraria;

    @ManyToOne('User', 'citasCreadas', { nullable: true })
    @JoinColumn({ name: 'creado_por' })
    creador: any;

    @OneToOne('Atencion', 'cita', { nullable: true })
    atencion: any;
}