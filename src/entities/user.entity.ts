import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Turno } from './turno.entity';

export enum UserRole {
  ADMIN = 'admin',
  RECEPCION = 'recepcion',
  ESTUDIANTE = 'estudiante',
  DOCENTE = 'docente'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 }) // Aumentamos longitud para hash bcrypt
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  rol: UserRole;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt: Date;

  // Relaciones existentes
  @OneToMany(() => Turno, turno => turno.estudiante)
  turnosComoEstudiante: Turno[];

  @OneToMany(() => Turno, turno => turno.supervisor)
  turnosComoSupervisor: Turno[];

  // Nuevas relaciones Sprint 2
  @OneToMany('Historia', 'creador')
  historiasCreadas: any[];

  @OneToMany('Odontograma', 'creador')
  odontogramasCreados: any[];

  @OneToMany('Adjunto', 'creador')
  adjuntosCreados: any[];
}