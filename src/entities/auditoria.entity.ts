import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AccionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  tabla: string;

  @Column({ type: 'int', name: 'registro_id' })
  registroId: number;

  @Column({ type: 'enum', enum: AccionAuditoria })
  accion: AccionAuditoria;

  @Column({ type: 'jsonb', nullable: true, name: 'datos_anteriores' })
  datosAnteriores: any;

  @Column({ type: 'jsonb', nullable: true, name: 'datos_nuevos' })
  datosNuevos: any;

  @Column({ type: 'int', nullable: true, name: 'usuario_id' })
  usuarioId: number;

  @CreateDateColumn()
  fecha: Date;

  // Relaciones
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}