import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Expose } from 'class-transformer';
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

    @Column({ type: 'int', name: 'cupos_maximos', nullable: true })
    cuposMaximos?: number;

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

    @OneToMany('Cita', 'franja')
    citas: any[];

    // Getter que calcula cupos automáticamente y se incluye en JSON
    @Expose()
    get cuposCalculados(): number {
        // Si hay cuposMaximos definidos, usar ese valor
        if (this.cuposMaximos !== null && this.cuposMaximos !== undefined) {
            return this.cuposMaximos;
        }

        // Calcular automáticamente basado en horarios
        if (!this.horaInicio || !this.horaFin || !this.duracionCitaMin) {
            return 0;
        }

        const [horaIni, minIni] = this.horaInicio.split(':').map(Number);
        const [horaFin, minFin] = this.horaFin.split(':').map(Number);

        const minutosInicio = horaIni * 60 + minIni;
        const minutosFin = horaFin * 60 + minFin;
        const totalMinutos = minutosFin - minutosInicio;

        return Math.floor(totalMinutos / this.duracionCitaMin);
    }
}
