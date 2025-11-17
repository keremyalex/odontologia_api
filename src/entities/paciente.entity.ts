import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Turno } from './turno.entity';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 150 })
  apellido: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ci: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_nac' })
  fechaNac: Date;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'estado_civil' })
  estadoCivil: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  sexo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nacionalidad: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  // Relaciones existentes
  @OneToMany(() => Turno, turno => turno.paciente)
  turnos: Turno[];

  // Nuevas relaciones Sprint 2
  @OneToMany('Historia', 'paciente')
  historias: any[];
}