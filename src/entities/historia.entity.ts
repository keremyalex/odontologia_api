import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Paciente } from './paciente.entity';
import { User } from './user.entity';
import { Odontograma } from './odontograma.entity';
import { Adjunto } from './adjunto.entity';

@Entity('historias')
export class Historia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'paciente_id' })
  pacienteId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'int', nullable: true, name: 'creado_por' })
  creadoPor: number;

  @Column({ type: 'jsonb' })
  cuestionario: any; // JSON con las respuestas del cuestionario médico general

  @Column({ type: 'jsonb', nullable: true, name: 'cuestionario_odontologico' })
  cuestionarioOdontologico?: any; // JSON con las respuestas del cuestionario odontológico

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt: Date;

  // Relaciones
  @ManyToOne(() => Paciente, paciente => paciente.historias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => User, user => user.historiasCreadas, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creador: User;

  @OneToMany(() => Odontograma, odontograma => odontograma.historia)
  odontogramas: Odontograma[];

  @OneToMany(() => Adjunto, adjunto => adjunto.historia)
  adjuntos: Adjunto[];

  @OneToMany('Atencion', 'historia')
  atenciones: any[];
}