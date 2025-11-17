import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Historia } from './historia.entity';
import { User } from './user.entity';

@Entity('adjuntos')
export class Adjunto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'historia_id' })
  historiaId: number;

  @Column({ type: 'varchar', length: 255, name: 'nombre_original' })
  nombreOriginal: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_archivo' })
  nombreArchivo: string;

  @Column({ type: 'text', name: 'ruta_archivo' })
  rutaArchivo: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 100, name: 'tipo_mime' })
  tipoMime: string;

  @Column({ type: 'int', name: 'tamano' })
  tamano: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', nullable: true, name: 'creado_por' })
  creadoPor: number;

  @CreateDateColumn({ name: 'fecha_subida' })
  fechaSubida: Date;

  // Relaciones
  @ManyToOne(() => Historia, historia => historia.adjuntos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_id' })
  historia: Historia;

  @ManyToOne(() => User, user => user.adjuntosCreados, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creador: User;
}