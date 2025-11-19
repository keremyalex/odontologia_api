import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cita, CitaEstado } from '../entities/cita.entity';
import { FranjaHoraria } from '../entities/franja-horaria.entity';
import { Paciente } from '../entities/paciente.entity';
import { CreateCitaDto, ReagendarCitaDto, CambiarEstadoCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
    @InjectRepository(FranjaHoraria)
    private franjaHorariaRepository: Repository<FranjaHoraria>,
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,
  ) {}

  async create(createCitaDto: CreateCitaDto, usuarioId: number): Promise<Cita> {
    // Validaciones previas
    await this.validateCreateCita(createCitaDto);

    // Crear la cita
    const cita = this.citaRepository.create({
      ...createCitaDto,
      creadoPor: usuarioId,
      fecha: this.parseLocalDate(createCitaDto.fecha)
    });

    const savedCita = await this.citaRepository.save(cita);
    return this.findOne(savedCita.id);
  }

  async findAll(): Promise<Cita[]> {
    return await this.citaRepository.find({
      relations: ['paciente', 'franja', 'franja.especialidad', 'franja.responsable', 'creador'],
      order: { fecha: 'DESC', horaInicio: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Cita> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: ['paciente', 'franja', 'franja.especialidad', 'franja.responsable', 'creador']
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto, usuarioId: number): Promise<Cita> {
    const cita = await this.findOne(id);

    // Validar que la cita se pueda modificar
    if (cita.estado === CitaEstado.ATENDIDA) {
      throw new BadRequestException('No se puede modificar una cita que ya fue atendida');
    }

    // Si se están cambiando horarios o fecha, validar disponibilidad
    if (updateCitaDto.fecha || updateCitaDto.horaInicio || updateCitaDto.horaFin || updateCitaDto.franjaId) {
      const updatedData = {
        pacienteId: cita.pacienteId,
        franjaId: updateCitaDto.franjaId || cita.franjaId,
        fecha: updateCitaDto.fecha || cita.fecha.toISOString().split('T')[0],
        horaInicio: updateCitaDto.horaInicio || cita.horaInicio,
        horaFin: updateCitaDto.horaFin || cita.horaFin
      };

      await this.validateCreateCita(updatedData as CreateCitaDto, id);
    }

    // Actualizar los campos
    Object.assign(cita, updateCitaDto);
    if (updateCitaDto.fecha) {
      cita.fecha = this.parseLocalDate(updateCitaDto.fecha);
    }

    const updatedCita = await this.citaRepository.save(cita);
    return this.findOne(updatedCita.id);
  }

  async remove(id: number): Promise<void> {
    const cita = await this.findOne(id);
    
    if (cita.estado === CitaEstado.ATENDIDA) {
      throw new BadRequestException('No se puede eliminar una cita que ya fue atendida');
    }

    await this.citaRepository.remove(cita);
  }

  // Métodos específicos para gestión de citas

  async reagendar(id: number, reagendarDto: ReagendarCitaDto, usuarioId: number): Promise<Cita> {
    const cita = await this.findOne(id);

    if (cita.estado === CitaEstado.ATENDIDA) {
      throw new BadRequestException('No se puede reagendar una cita que ya fue atendida');
    }

    // Validar disponibilidad en la nueva fecha/hora
    await this.validateCreateCita({
      pacienteId: cita.pacienteId,
      franjaId: reagendarDto.franjaId,
      fecha: reagendarDto.fecha,
      horaInicio: reagendarDto.horaInicio,
      horaFin: reagendarDto.horaFin
    } as CreateCitaDto, id);

    // Actualizar la cita
    cita.franjaId = reagendarDto.franjaId;
    cita.fecha = this.parseLocalDate(reagendarDto.fecha);
    cita.horaInicio = reagendarDto.horaInicio;
    cita.horaFin = reagendarDto.horaFin;
    cita.estado = CitaEstado.REPROGRAMADA;
    
    if (reagendarDto.motivoReagendamiento) {
      cita.observaciones = (cita.observaciones || '') + `\n[REAGENDADA] ${reagendarDto.motivoReagendamiento}`;
    }

    const updatedCita = await this.citaRepository.save(cita);
    return this.findOne(updatedCita.id);
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoCitaDto, usuarioId: number): Promise<Cita> {
    const cita = await this.findOne(id);

    cita.estado = cambiarEstadoDto.estado;
    
    if (cambiarEstadoDto.observaciones) {
      cita.observaciones = (cita.observaciones || '') + `\n[${cambiarEstadoDto.estado.toUpperCase()}] ${cambiarEstadoDto.observaciones}`;
    }

    const updatedCita = await this.citaRepository.save(cita);
    return this.findOne(updatedCita.id);
  }

  // Métodos de consulta

  async findByPaciente(pacienteId: number): Promise<Cita[]> {
    return await this.citaRepository.find({
      where: { pacienteId },
      relations: ['franja', 'franja.especialidad', 'franja.responsable'],
      order: { fecha: 'DESC', horaInicio: 'ASC' }
    });
  }

  async findByFecha(fecha: string): Promise<Cita[]> {
    return await this.citaRepository.find({
      where: { fecha: this.parseLocalDate(fecha) },
      relations: ['paciente', 'franja', 'franja.especialidad', 'franja.responsable'],
      order: { horaInicio: 'ASC' }
    });
  }

  async findByFranjaYFecha(franjaId: number, fecha: string): Promise<Cita[]> {
    return await this.citaRepository.find({
      where: { franjaId, fecha: this.parseLocalDate(fecha) },
      relations: ['paciente'],
      order: { horaInicio: 'ASC' }
    });
  }

  async findByRangoFechas(fechaInicio: string, fechaFin: string): Promise<Cita[]> {
    return await this.citaRepository.find({
      where: {
        fecha: Between(new Date(fechaInicio), new Date(fechaFin))
      },
      relations: ['paciente', 'franja', 'franja.especialidad', 'franja.responsable'],
      order: { fecha: 'ASC', horaInicio: 'ASC' }
    });
  }

  async findByResponsable(responsableId: number, fecha?: string): Promise<Cita[]> {
    const queryBuilder = this.citaRepository.createQueryBuilder('cita')
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.franja', 'franja')
      .leftJoinAndSelect('franja.especialidad', 'especialidad')
      .where('franja.responsableId = :responsableId', { responsableId });

    if (fecha) {
      queryBuilder.andWhere('cita.fecha = :fecha', { fecha: new Date(fecha) });
    }

    return await queryBuilder
      .orderBy('cita.fecha', 'ASC')
      .addOrderBy('cita.horaInicio', 'ASC')
      .getMany();
  }

  async getDisponibilidadFranja(franjaId: number, fecha: string): Promise<any> {
    const franja = await this.franjaHorariaRepository.findOne({
      where: { id: franjaId },
      relations: ['especialidad']
    });

    if (!franja) {
      throw new NotFoundException(`Franja horaria con ID ${franjaId} no encontrada`);
    }

    const citasExistentes = await this.findByFranjaYFecha(franjaId, fecha);
    
    // Generar slots disponibles basados en la duración de cita
    const slots = this.generateTimeSlots(franja.horaInicio, franja.horaFin, franja.duracionCitaMin);
    const slotsOcupados = citasExistentes
      .filter(cita => cita.estado !== CitaEstado.CANCELADA)
      .map(cita => ({ inicio: cita.horaInicio, fin: cita.horaFin }));

    const slotsDisponibles = slots.filter(slot => 
      !slotsOcupados.some(ocupado => 
        (slot.inicio >= ocupado.inicio && slot.inicio < ocupado.fin) ||
        (slot.fin > ocupado.inicio && slot.fin <= ocupado.fin) ||
        (slot.inicio <= ocupado.inicio && slot.fin >= ocupado.fin)
      )
    );

    return {
      franja: {
        id: franja.id,
        especialidad: franja.especialidad.nombre,
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        duracionCita: franja.duracionCitaMin
      },
      fecha,
      totalSlots: slots.length,
      slotsDisponibles: slotsDisponibles.length,
      slotsOcupados: slotsOcupados.length,
      slots: {
        disponibles: slotsDisponibles,
        ocupados: slotsOcupados
      }
    };
  }

  // Métodos privados de validación

  private async validateCreateCita(createCitaDto: CreateCitaDto, excludeCitaId?: number): Promise<void> {
    // Validar formato de tiempo
    this.validateTimeFormat(createCitaDto.horaInicio);
    this.validateTimeFormat(createCitaDto.horaFin);
    this.validateTimeRange(createCitaDto.horaInicio, createCitaDto.horaFin);

    // Validar que el paciente existe
    const paciente = await this.pacienteRepository.findOne({
      where: { id: createCitaDto.pacienteId }
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${createCitaDto.pacienteId} no encontrado`);
    }

    // Validar que la franja horaria existe y está activa
    const franja = await this.franjaHorariaRepository.findOne({
      where: { id: createCitaDto.franjaId }
    });
    if (!franja) {
      throw new NotFoundException(`Franja horaria con ID ${createCitaDto.franjaId} no encontrada`);
    }
    if (franja.estado !== 'activo') {
      throw new BadRequestException('La franja horaria no está activa');
    }

    // Validar que la fecha no sea en el pasado
    const citaFecha = this.parseLocalDate(createCitaDto.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (citaFecha < hoy) {
      throw new BadRequestException('No se pueden crear citas en fechas pasadas');
    }

    // Validar que la hora esté dentro de la franja horaria
    const horaInicioCita = this.normalizeTimeFormat(createCitaDto.horaInicio);
    const horaFinCita = this.normalizeTimeFormat(createCitaDto.horaFin);
    const horaInicioFranja = this.normalizeTimeFormat(franja.horaInicio);
    const horaFinFranja = this.normalizeTimeFormat(franja.horaFin);
    
    if (horaInicioCita < horaInicioFranja || horaFinCita > horaFinFranja) {
      throw new BadRequestException(`El horario de la cita debe estar dentro de la franja horaria (${franja.horaInicio} - ${franja.horaFin})`);
    }

    // Validar que el día de la semana coincida con la franja
    const diaSemana = citaFecha.getDay() === 0 ? 7 : citaFecha.getDay(); // Convertir domingo de 0 a 7
    if (diaSemana !== franja.diaSemana) {
      throw new BadRequestException(`La fecha no corresponde al día de la franja horaria. Fecha: ${createCitaDto.fecha} es día ${diaSemana}, pero la franja es para día ${franja.diaSemana}`);
    }

    // Validar que no hay solapamiento con otras citas
    const fechaStr = citaFecha.toISOString().split('T')[0];
    const citasExistentes = await this.citaRepository.createQueryBuilder('cita')
      .where('cita.franjaId = :franjaId', { franjaId: createCitaDto.franjaId })
      .andWhere('cita.fecha = :fecha', { fecha: fechaStr })
      .andWhere('cita.estado != :estado', { estado: CitaEstado.CANCELADA });
    
    if (excludeCitaId) {
      citasExistentes.andWhere('cita.id != :excludeId', { excludeId: excludeCitaId });
    }

    const citas = await citasExistentes.getMany();

    const hayConflicto = citas.some(cita => 
      (createCitaDto.horaInicio >= cita.horaInicio && createCitaDto.horaInicio < cita.horaFin) ||
      (createCitaDto.horaFin > cita.horaInicio && createCitaDto.horaFin <= cita.horaFin) ||
      (createCitaDto.horaInicio <= cita.horaInicio && createCitaDto.horaFin >= cita.horaFin)
    );

    if (hayConflicto) {
      throw new ConflictException('Ya existe una cita en ese horario');
    }

    // Validar que el paciente no tenga otra cita en el mismo día
    const citasPacienteDia = await this.citaRepository.find({
      where: {
        pacienteId: createCitaDto.pacienteId,
        fecha: citaFecha,
        estado: CitaEstado.PROGRAMADA
      }
    });

    const citasPacienteActivas = excludeCitaId 
      ? citasPacienteDia.filter(c => c.id !== excludeCitaId)
      : citasPacienteDia;

    if (citasPacienteActivas.length > 0) {
      throw new ConflictException('El paciente ya tiene una cita programada para ese día');
    }
  }

  private validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException(`Formato de hora inválido: ${time}. Use formato HH:MM`);
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de fin');
    }
  }

  private generateTimeSlots(horaInicio: string, horaFin: string, duracionMin: number): Array<{inicio: string, fin: string}> {
    const slots: Array<{inicio: string, fin: string}> = [];
    let [horaActual, minutoActual] = horaInicio.split(':').map(Number);
    const [horaFinNum, minutoFinNum] = horaFin.split(':').map(Number);
    
    while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFinNum)) {
      const inicioSlot = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`;
      
      // Calcular hora fin del slot
      minutoActual += duracionMin;
      if (minutoActual >= 60) {
        horaActual += Math.floor(minutoActual / 60);
        minutoActual = minutoActual % 60;
      }
      
      const finSlot = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`;
      
      // Verificar que el slot no exceda la hora fin de la franja
      if (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual <= minutoFinNum)) {
        slots.push({ inicio: inicioSlot, fin: finSlot });
      }
    }
    
    return slots;
  }

  private normalizeTimeFormat(time: string): string {
    // Convertir "10:45" a "10:45:00" para comparación consistente
    if (time.length === 5 && time.includes(':')) {
      return time + ':00';
    }
    return time;
  }

  private parseLocalDate(dateString: string): Date {
    // Parsear fecha en formato YYYY-MM-DD como fecha local, no UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa meses base 0
  }
}