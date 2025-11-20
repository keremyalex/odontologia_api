import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Cita } from './cita.entity';
import { Historia } from './historia.entity';
import { User } from './user.entity';

@Entity('atenciones')
@Index('idx_atencion_cita', ['citaId'], { unique: true })
export class Atencion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'cita_id' })
  citaId: number;

  @Column({ type: 'int', name: 'historia_id' })
  historiaId: number;

  @Column({ type: 'text', name: 'diagnostico_presuntivo' })
  diagnosticoPresuntivo: string;

  @Column({ type: 'text', name: 'plan_tratamiento' })
  planTratamiento: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'jsonb', name: 'estado_bucal_general' })
  estadoBucalGeneral: {
    presenciaSarro: boolean;
    enfermedadPeriodontal: boolean;
    higieneBucal: 'muy_bueno' | 'bueno' | 'deficiente' | 'malo';
    otros: string;
  };

  @Column({ type: 'int', name: 'atendido_por' })
  atendidoPor: number;

  @CreateDateColumn({ name: 'fecha_atencion' })
  fechaAtencion: Date;

  @Column({ type: 'timestamp', name: 'actualizado_at', default: () => 'CURRENT_TIMESTAMP' })
  actualizadoAt: Date;

  // Relaciones
  @ManyToOne(() => Cita, cita => cita.atencion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cita_id' })
  cita: Cita;

  @ManyToOne(() => Historia, historia => historia.atenciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_id' })
  historia: Historia;

  @ManyToOne(() => User, user => user.atencionesRealizadas)
  @JoinColumn({ name: 'atendido_por' })
  atencionPor: User;
}