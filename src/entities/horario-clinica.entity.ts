import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('horario_clinica')
export class HorarioClinica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', array: true, name: 'dias_semana' })
  diasSemana: number[]; // Array de días: 1=Lunes, 2=Martes, etc.

  @Column({ type: 'time', name: 'hora_apertura' })
  horaApertura: string;

  @Column({ type: 'time', name: 'hora_cierre' })
  horaCierre: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
