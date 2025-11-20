import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
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
  dientes: any; // JSON array con la estructura completa de 32 dientes

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'int', nullable: true, name: 'creado_por' })
  creadoPor: number;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt: Date;

  @UpdateDateColumn({ name: 'actualizado_at' })
  actualizadoAt: Date;

  // Relaciones
  @ManyToOne(() => Historia, historia => historia.odontogramas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historia_id' })
  historia: Historia;

  @ManyToOne(() => User, user => user.odontogramasCreados, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creador: User;

  // Métodos auxiliares para trabajar con los dientes
  getDientes(): any[] {
    return Array.isArray(this.dientes) ? this.dientes : [];
  }

  setDientes(dientes: any[]): void {
    this.dientes = dientes;
  }

  // Generar odontograma inicial con 32 dientes sanos
  static generarDientesIniciales(): any[] {
    const dientes: any[] = [];
    const grupos = [
      { numeros: ['1.8', '1.7', '1.6', '1.5', '1.4'], grupo: 1, posicion: 'Superior Derecho' },
      { numeros: ['1.3', '1.2', '1.1', '2.1', '2.2', '2.3'], grupo: 2, posicion: 'Superior Centro' },
      { numeros: ['2.4', '2.5', '2.6', '2.7', '2.8'], grupo: 3, posicion: 'Superior Izquierdo' },
      { numeros: ['4.8', '4.7', '4.6', '4.5', '4.4'], grupo: 4, posicion: 'Inferior Derecho' },
      { numeros: ['4.3', '4.2', '4.1', '3.1', '3.2', '3.3'], grupo: 5, posicion: 'Inferior Centro' },
      { numeros: ['3.4', '3.5', '3.6', '3.7', '3.8'], grupo: 6, posicion: 'Inferior Izquierdo' }
    ];

    for (const grupo of grupos) {
      for (const numero of grupo.numeros) {
        const id = parseInt(numero.replace('.', ''));
        dientes.push({
          id,
          number: numero,
          position: grupo.posicion,
          group: grupo.grupo,
          status: 'sano',
          surfaces: {
            vestibular: 'sano',
            oclusal: 'sano',
            distal: 'sano',
            lingual: 'sano',
            mesial: 'sano'
          },
          isTemporary: false,
          observations: ''
        });
      }
    }

    return dientes;
  }
}