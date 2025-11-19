import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorarioClinica } from '../entities/horario-clinica.entity';
import { FranjaHoraria } from '../entities/franja-horaria.entity';
import { CreateHorarioClinicaDto } from './dto/create-horario-clinica.dto';
import { UpdateHorarioClinicaDto } from './dto/update-horario-clinica.dto';
import { CreateFranjaHorariaDto } from './dto/create-franja-horaria.dto';
import { UpdateFranjaHorariaDto } from './dto/update-franja-horaria.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(HorarioClinica)
    private horarioClinicaRepository: Repository<HorarioClinica>,
    @InjectRepository(FranjaHoraria)
    private franjaHorariaRepository: Repository<FranjaHoraria>,
  ) {}

  // ===== HORARIOS CLÍNICA =====
  async createHorarioClinica(createHorarioClinicaDto: CreateHorarioClinicaDto): Promise<HorarioClinica> {
    this.validateTimeFormat(createHorarioClinicaDto.horaApertura);
    this.validateTimeFormat(createHorarioClinicaDto.horaCierre);
    this.validateTimeRange(createHorarioClinicaDto.horaApertura, createHorarioClinicaDto.horaCierre);
    this.validateDaysOfWeek(createHorarioClinicaDto.diasSemana);

    const horario = this.horarioClinicaRepository.create(createHorarioClinicaDto);
    return await this.horarioClinicaRepository.save(horario);
  }

  async findAllHorariosClinica(): Promise<HorarioClinica[]> {
    return await this.horarioClinicaRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOneHorarioClinica(id: number): Promise<HorarioClinica> {
    const horario = await this.horarioClinicaRepository.findOne({ where: { id } });
    if (!horario) {
      throw new NotFoundException(`Horario de clínica con ID ${id} no encontrado`);
    }
    return horario;
  }

  async updateHorarioClinica(id: number, updateHorarioClinicaDto: UpdateHorarioClinicaDto): Promise<HorarioClinica> {
    const horario = await this.findOneHorarioClinica(id);

    if (updateHorarioClinicaDto.horaApertura) {
      this.validateTimeFormat(updateHorarioClinicaDto.horaApertura);
    }
    if (updateHorarioClinicaDto.horaCierre) {
      this.validateTimeFormat(updateHorarioClinicaDto.horaCierre);
    }
    if (updateHorarioClinicaDto.horaApertura && updateHorarioClinicaDto.horaCierre) {
      this.validateTimeRange(updateHorarioClinicaDto.horaApertura, updateHorarioClinicaDto.horaCierre);
    }
    if (updateHorarioClinicaDto.diasSemana) {
      this.validateDaysOfWeek(updateHorarioClinicaDto.diasSemana);
    }

    Object.assign(horario, updateHorarioClinicaDto);
    return await this.horarioClinicaRepository.save(horario);
  }

  async removeHorarioClinica(id: number): Promise<void> {
    const horario = await this.findOneHorarioClinica(id);
    await this.horarioClinicaRepository.remove(horario);
  }

  // ===== FRANJAS HORARIAS =====
  async createFranjaHoraria(createFranjaHorariaDto: CreateFranjaHorariaDto): Promise<FranjaHoraria> {
    this.validateTimeFormat(createFranjaHorariaDto.horaInicio);
    this.validateTimeFormat(createFranjaHorariaDto.horaFin);
    this.validateTimeRange(createFranjaHorariaDto.horaInicio, createFranjaHorariaDto.horaFin);

    // Verificar que no exista una franja que se superponga
    await this.validateNoOverlappingFrames(createFranjaHorariaDto);

    const franja = this.franjaHorariaRepository.create(createFranjaHorariaDto);
    return await this.franjaHorariaRepository.save(franja);
  }

  async findAllFranjasHorarias(): Promise<any[]> {
    const franjas = await this.franjaHorariaRepository.find({
      relations: ['especialidad', 'responsable'],
      order: { diaSemana: 'ASC', horaInicio: 'ASC' }
    });
    
    return this.addCuposCalculados(franjas);
  }

  async findOneFranjaHoraria(id: number): Promise<any> {
    const franja = await this.franjaHorariaRepository.findOne({
      where: { id },
      relations: ['especialidad', 'responsable']
    });
    
    if (!franja) {
      throw new NotFoundException(`Franja horaria con ID ${id} no encontrada`);
    }
    
    return this.addCuposCalculados([franja])[0];
  }

  async updateFranjaHoraria(id: number, updateFranjaHorariaDto: UpdateFranjaHorariaDto): Promise<FranjaHoraria> {
    const franja = await this.findOneFranjaHoraria(id);

    if (updateFranjaHorariaDto.horaInicio) {
      this.validateTimeFormat(updateFranjaHorariaDto.horaInicio);
    }
    if (updateFranjaHorariaDto.horaFin) {
      this.validateTimeFormat(updateFranjaHorariaDto.horaFin);
    }
    if (updateFranjaHorariaDto.horaInicio && updateFranjaHorariaDto.horaFin) {
      this.validateTimeRange(updateFranjaHorariaDto.horaInicio, updateFranjaHorariaDto.horaFin);
    }

    // Verificar superposiciones solo si se cambian horarios, día o responsable
    if (updateFranjaHorariaDto.horaInicio || updateFranjaHorariaDto.horaFin || 
        updateFranjaHorariaDto.diaSemana || updateFranjaHorariaDto.responsableId) {
      await this.validateNoOverlappingFramesUpdate(id, updateFranjaHorariaDto);
    }

    Object.assign(franja, updateFranjaHorariaDto);
    return await this.franjaHorariaRepository.save(franja);
  }

  async removeFranjaHoraria(id: number): Promise<void> {
    const franja = await this.findOneFranjaHoraria(id);
    await this.franjaHorariaRepository.remove(franja);
  }

  async findFranjasByDiaYEspecialidad(diaSemana: number, especialidadId: number): Promise<any[]> {
    const franjas = await this.franjaHorariaRepository.find({
      where: { diaSemana, especialidadId, estado: 'activo' },
      relations: ['especialidad', 'responsable'],
      order: { horaInicio: 'ASC' }
    });
    
    return this.addCuposCalculados(franjas);
  }

  async findFranjasByResponsable(responsableId: number): Promise<any[]> {
    const franjas = await this.franjaHorariaRepository.find({
      where: { responsableId },
      relations: ['especialidad', 'responsable'],
      order: { diaSemana: 'ASC', horaInicio: 'ASC' }
    });
    
    return this.addCuposCalculados(franjas);
  }

  // ===== MÉTODOS DE VALIDACIÓN =====
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

  private validateDaysOfWeek(days: number[]): void {
    const validDays = [1, 2, 3, 4, 5, 6, 7];
    const uniqueDays = [...new Set(days)];
    
    if (uniqueDays.length !== days.length) {
      throw new BadRequestException('No se permiten días duplicados');
    }

    for (const day of days) {
      if (!validDays.includes(day)) {
        throw new BadRequestException(`Día inválido: ${day}. Use valores entre 1-7`);
      }
    }
  }

  private async validateNoOverlappingFrames(createDto: CreateFranjaHorariaDto): Promise<void> {
    const overlapping = await this.franjaHorariaRepository.createQueryBuilder('franja')
      .where('franja.diaSemana = :diaSemana', { diaSemana: createDto.diaSemana })
      .andWhere('franja.responsableId = :responsableId', { responsableId: createDto.responsableId })
      .andWhere('franja.estado = :estado', { estado: 'activo' })
      .andWhere(
        '(franja.horaInicio < :horaFin AND franja.horaFin > :horaInicio)',
        { horaInicio: createDto.horaInicio, horaFin: createDto.horaFin }
      )
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        `Ya existe una franja horaria para el responsable en ese horario: ${overlapping.horaInicio}-${overlapping.horaFin}`
      );
    }
  }

  private async validateNoOverlappingFramesUpdate(id: number, updateDto: UpdateFranjaHorariaDto): Promise<void> {
    const current = await this.findOneFranjaHoraria(id);
    
    const diaSemana = updateDto.diaSemana ?? current.diaSemana;
    const responsableId = updateDto.responsableId ?? current.responsableId;
    const horaInicio = updateDto.horaInicio ?? current.horaInicio;
    const horaFin = updateDto.horaFin ?? current.horaFin;

    const overlapping = await this.franjaHorariaRepository.createQueryBuilder('franja')
      .where('franja.id != :currentId', { currentId: id })
      .andWhere('franja.diaSemana = :diaSemana', { diaSemana })
      .andWhere('franja.responsableId = :responsableId', { responsableId })
      .andWhere('franja.estado = :estado', { estado: 'activo' })
      .andWhere(
        '(franja.horaInicio < :horaFin AND franja.horaFin > :horaInicio)',
        { horaInicio, horaFin }
      )
      .getOne();

    if (overlapping) {
      throw new ConflictException(
        `Ya existe una franja horaria para el responsable en ese horario: ${overlapping.horaInicio}-${overlapping.horaFin}`
      );
    }
  }

  // Método privado para agregar cuposCalculados a las franjas
  private addCuposCalculados(franjas: FranjaHoraria[]): any[] {
    return franjas.map(franja => {
      // Calcular cupos
      let cuposCalculados: number;
      
      if (franja.cuposMaximos !== null && franja.cuposMaximos !== undefined) {
        cuposCalculados = franja.cuposMaximos;
      } else {
        // Calcular automáticamente basado en horarios
        const [horaIni, minIni] = franja.horaInicio.split(':').map(Number);
        const [horaFin, minFin] = franja.horaFin.split(':').map(Number);
        
        const minutosInicio = horaIni * 60 + minIni;
        const minutosFin = horaFin * 60 + minFin;
        const totalMinutos = minutosFin - minutosInicio;
        
        cuposCalculados = Math.floor(totalMinutos / franja.duracionCitaMin);
      }
      
      // Crear un objeto que incluya todos los campos de la franja más cuposCalculados
      return {
        ...franja,
        cuposCalculados
      };
    });
  }
}
