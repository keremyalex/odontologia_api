import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Historia } from './historia.entity';
import { User } from './user.entity';

@Entity('odontogramas')
@Index('idx_odontograma_historia_version', ['historiaId', 'version'], { unique: true })
export class Odontograma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'historia_id' })
  historiaId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'jsonb' })
  datos: any; // JSON con el estado de los dientes

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'int', nullable: true, name: 'creado_por' })
  creadoPor: number;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt: Date;

  // Relaciones
  @ManyToOne(() => Historia, historia => historia.odontogramas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_id' })
  historia: Historia;

  @ManyToOne(() => User, user => user.odontogramasCreados, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creador: User;
}