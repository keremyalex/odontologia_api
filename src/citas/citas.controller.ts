import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto, ReagendarCitaDto, CambiarEstadoCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { Cita } from '../entities/cita.entity';

@ApiTags('citas')
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear una nueva cita',
    description: 'Registra una nueva cita para un paciente en una franja horaria específica'
  })
  @ApiResponse({ status: 201, description: 'Cita creada exitosamente', type: Cita })
  @ApiResponse({ status: 400, description: 'Datos inválidos o conflicto de horarios' })
  @ApiResponse({ status: 404, description: 'Paciente o franja horaria no encontrados' })
  @ApiResponse({ status: 409, description: 'El paciente ya tiene una cita en esa fecha' })
  create(@Body() createCitaDto: CreateCitaDto, @Req() req: any): Promise<Cita> {
    const usuarioId = req.user?.sub || 1; // Obtener ID del usuario autenticado
    return this.citasService.create(createCitaDto, usuarioId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las citas',
    description: 'Recupera la lista completa de citas con información de pacientes y franjas'
  })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida exitosamente', type: [Cita] })
  findAll(): Promise<Cita[]> {
    return this.citasService.findAll();
  }

  @Get('disponibilidad/:franjaId')
  @ApiOperation({ 
    summary: 'Consultar disponibilidad de una franja horaria',
    description: 'Obtiene los slots disponibles y ocupados para una franja en una fecha específica'
  })
  @ApiParam({ name: 'franjaId', description: 'ID de la franja horaria', type: 'number', example: 1 })
  @ApiQuery({ name: 'fecha', description: 'Fecha a consultar (YYYY-MM-DD)', example: '2025-11-20' })
  @ApiResponse({ status: 200, description: 'Disponibilidad obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Franja horaria no encontrada' })
  getDisponibilidad(
    @Param('franjaId', ParseIntPipe) franjaId: number,
    @Query('fecha') fecha: string
  ): Promise<any> {
    return this.citasService.getDisponibilidadFranja(franjaId, fecha);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ 
    summary: 'Obtener citas por paciente',
    description: 'Recupera todas las citas de un paciente específico'
  })
  @ApiParam({ name: 'pacienteId', description: 'ID del paciente', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Citas del paciente obtenidas exitosamente', type: [Cita] })
  findByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number): Promise<Cita[]> {
    return this.citasService.findByPaciente(pacienteId);
  }

  @Get('fecha/:fecha')
  @ApiOperation({ 
    summary: 'Obtener citas por fecha',
    description: 'Recupera todas las citas de una fecha específica'
  })
  @ApiParam({ name: 'fecha', description: 'Fecha (YYYY-MM-DD)', example: '2025-11-20' })
  @ApiResponse({ status: 200, description: 'Citas de la fecha obtenidas exitosamente', type: [Cita] })
  findByFecha(@Param('fecha') fecha: string): Promise<Cita[]> {
    return this.citasService.findByFecha(fecha);
  }

  @Get('responsable/:responsableId')
  @ApiOperation({ 
    summary: 'Obtener citas por responsable',
    description: 'Recupera todas las citas asignadas a un responsable (docente) específico'
  })
  @ApiParam({ name: 'responsableId', description: 'ID del responsable', type: 'number', example: 45 })
  @ApiQuery({ name: 'fecha', description: 'Filtrar por fecha específica (opcional)', required: false, example: '2025-11-20' })
  @ApiResponse({ status: 200, description: 'Citas del responsable obtenidas exitosamente', type: [Cita] })
  findByResponsable(
    @Param('responsableId', ParseIntPipe) responsableId: number,
    @Query('fecha') fecha?: string
  ): Promise<Cita[]> {
    return this.citasService.findByResponsable(responsableId, fecha);
  }

  @Get('rango')
  @ApiOperation({ 
    summary: 'Obtener citas por rango de fechas',
    description: 'Recupera todas las citas dentro de un rango de fechas'
  })
  @ApiQuery({ name: 'fechaInicio', description: 'Fecha inicio (YYYY-MM-DD)', example: '2025-11-20' })
  @ApiQuery({ name: 'fechaFin', description: 'Fecha fin (YYYY-MM-DD)', example: '2025-11-25' })
  @ApiResponse({ status: 200, description: 'Citas del rango obtenidas exitosamente', type: [Cita] })
  findByRango(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string
  ): Promise<Cita[]> {
    return this.citasService.findByRango(fechaInicio, fechaFin);
  }

  @Get('pendientes-atencion')
  @ApiOperation({ 
    summary: 'Obtener citas pendientes de atención',
    description: 'Recupera todas las citas en estado PROGRAMADA que están listas para ser atendidas'
  })
  @ApiResponse({ status: 200, description: 'Citas pendientes obtenidas exitosamente', type: [Cita] })
  findPendientesAtencion(): Promise<Cita[]> {
    return this.citasService.findPendientesAtencion();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener una cita por ID',
    description: 'Recupera los detalles de una cita específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Cita encontrada', type: Cita })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cita> {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar una cita',
    description: 'Modifica los datos de una cita existente (no permite modificar citas atendidas)'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Cita actualizada exitosamente', type: Cita })
  @ApiResponse({ status: 400, description: 'No se puede modificar una cita atendida' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto de horarios' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateCitaDto: UpdateCitaDto,
    @Req() req: any
  ): Promise<Cita> {
    const usuarioId = req.user?.sub || 1;
    return this.citasService.update(id, updateCitaDto, usuarioId);
  }

  @Patch(':id/reagendar')
  @ApiOperation({ 
    summary: 'Reagendar una cita',
    description: 'Cambia la fecha y horario de una cita existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Cita reagendada exitosamente', type: Cita })
  @ApiResponse({ status: 400, description: 'No se puede reagendar una cita atendida' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto en la nueva fecha/hora' })
  reagendar(
    @Param('id', ParseIntPipe) id: number,
    @Body() reagendarDto: ReagendarCitaDto,
    @Req() req: any
  ): Promise<Cita> {
    const usuarioId = req.user?.sub || 1;
    return this.citasService.reagendar(id, reagendarDto, usuarioId);
  }

  @Patch(':id/estado')
  @ApiOperation({ 
    summary: 'Cambiar estado de una cita',
    description: 'Actualiza el estado de una cita (programada, atendida, cancelada, etc.)'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Estado de cita actualizado exitosamente', type: Cita })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoCitaDto,
    @Req() req: any
  ): Promise<Cita> {
    const usuarioId = req.user?.sub || 1;
    return this.citasService.cambiarEstado(id, cambiarEstadoDto, usuarioId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar una cita',
    description: 'Elimina una cita del sistema (solo permite eliminar citas no atendidas)'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Cita eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar una cita atendida' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.citasService.remove(id);
    return { message: 'Cita eliminada exitosamente' };
  }
}