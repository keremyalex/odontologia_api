import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Paciente } from './paciente.entity';
import { User } from './user.entity';

export enum TurnoEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  ATENDIDO = 'atendido',
  CANCELADO = 'cancelado'
}

@Entity('turnos')
@Index('idx_turnos_fecha', ['fechaInicio'])
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'paciente_id' })
  pacienteId: number;

  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Column({ type: 'timestamp', name: 'fecha_fin' })
  fechaFin: Date;

  @Column({ type: 'enum', enum: TurnoEstado, default: TurnoEstado.PENDIENTE })
  estado: TurnoEstado;

  @Column({ type: 'int', nullable: true, name: 'estudiante_id' })
  estudianteId: number;

  @Column({ type: 'int', nullable: true, name: 'supervisor_id' })
  supervisorId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  consultorio: string;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt: Date;

  // Relaciones
  @ManyToOne(() => Paciente, paciente => paciente.turnos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => User, user => user.turnosComoEstudiante, { nullable: true })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: User;

  @ManyToOne(() => User, user => user.turnosComoSupervisor, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User;
}