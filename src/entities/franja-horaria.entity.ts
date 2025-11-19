import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { Especialidad } from './especialidad.entity';
import { User } from './user.entity';

@Entity('franja_horaria')
@Index('idx_franja_dia_esp', ['diaSemana', 'especialidadId'])
export class FranjaHoraria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', name: 'dia_semana' })
  diaSemana: number; // 1=Lunes, 2=Martes, ..., 7=Domingo

  @Column({ type: 'int', name: 'id_especialidad' })
  especialidadId: number;

  @Column({ type: 'int', name: 'id_responsable' })
  responsableId: number;

  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;

  @Column({ type: 'int', name: 'duracion_cita_min', default: 30 })
  duracionCitaMin: number;

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Especialidad, especialidad => especialidad.franjasHorarias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_especialidad' })
  especialidad: Especialidad;

  @ManyToOne(() => User, user => user.franjasHorarias, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_responsable' })
  responsable: User;
}
