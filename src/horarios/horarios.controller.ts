import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HorariosService } from './horarios.service';
import { CreateHorarioClinicaDto } from './dto/create-horario-clinica.dto';
import { UpdateHorarioClinicaDto } from './dto/update-horario-clinica.dto';
import { CreateFranjaHorariaDto } from './dto/create-franja-horaria.dto';
import { UpdateFranjaHorariaDto } from './dto/update-franja-horaria.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { HorarioClinica } from '../entities/horario-clinica.entity';
import { FranjaHoraria } from '../entities/franja-horaria.entity';

@ApiTags('Horarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  // ===== HORARIOS DE CLÍNICA =====
  
  @Post('clinica')
  @ApiOperation({ 
    summary: 'Crear horario de clínica',
    description: 'Registra un nuevo horario general de funcionamiento de la clínica'
  })
  @ApiResponse({ status: 201, description: 'Horario de clínica creado exitosamente', type: HorarioClinica })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  createHorarioClinica(@Body() createHorarioClinicaDto: CreateHorarioClinicaDto): Promise<HorarioClinica> {
    return this.horariosService.createHorarioClinica(createHorarioClinicaDto);
  }

  @Get('clinica')
  @ApiOperation({ 
    summary: 'Obtener horarios de clínica',
    description: 'Recupera todos los horarios generales de la clínica'
  })
  @ApiResponse({ status: 200, description: 'Lista de horarios de clínica', type: [HorarioClinica] })
  findAllHorariosClinica(): Promise<HorarioClinica[]> {
    return this.horariosService.findAllHorariosClinica();
  }

  @Get('clinica/:id')
  @ApiOperation({ 
    summary: 'Obtener horario de clínica por ID',
    description: 'Recupera los detalles de un horario de clínica específico'
  })
  @ApiParam({ name: 'id', description: 'ID del horario de clínica', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Horario de clínica encontrado', type: HorarioClinica })
  @ApiResponse({ status: 404, description: 'Horario de clínica no encontrado' })
  findOneHorarioClinica(@Param('id', ParseIntPipe) id: number): Promise<HorarioClinica> {
    return this.horariosService.findOneHorarioClinica(id);
  }

  @Patch('clinica/:id')
  @ApiOperation({ 
    summary: 'Actualizar horario de clínica',
    description: 'Modifica un horario general de la clínica'
  })
  @ApiParam({ name: 'id', description: 'ID del horario de clínica', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Horario de clínica actualizado exitosamente', type: HorarioClinica })
  @ApiResponse({ status: 404, description: 'Horario de clínica no encontrado' })
  updateHorarioClinica(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioClinicaDto: UpdateHorarioClinicaDto
  ): Promise<HorarioClinica> {
    return this.horariosService.updateHorarioClinica(id, updateHorarioClinicaDto);
  }

  @Delete('clinica/:id')
  @ApiOperation({ 
    summary: 'Eliminar horario de clínica',
    description: 'Elimina un horario general de la clínica'
  })
  @ApiParam({ name: 'id', description: 'ID del horario de clínica', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Horario de clínica eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Horario de clínica no encontrado' })
  async removeHorarioClinica(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.horariosService.removeHorarioClinica(id);
    return { message: 'Horario de clínica eliminado exitosamente' };
  }

  // ===== FRANJAS HORARIAS =====
  
  @Post('franjas')
  @ApiOperation({ 
    summary: 'Crear franja horaria',
    description: 'Registra una nueva franja horaria para una especialidad y responsable'
  })
  @ApiResponse({ status: 201, description: 'Franja horaria creada exitosamente', type: FranjaHoraria })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una franja horaria que se superpone' })
  createFranjaHoraria(@Body() createFranjaHorariaDto: CreateFranjaHorariaDto): Promise<FranjaHoraria> {
    return this.horariosService.createFranjaHoraria(createFranjaHorariaDto);
  }

  @Get('franjas')
  @ApiOperation({ 
    summary: 'Obtener franjas horarias',
    description: 'Recupera todas las franjas horarias con opciones de filtrado'
  })
  @ApiQuery({ name: 'dia', description: 'Filtrar por día de la semana (1-7)', required: false, type: 'number' })
  @ApiQuery({ name: 'especialidad', description: 'Filtrar por ID de especialidad', required: false, type: 'number' })
  @ApiQuery({ name: 'responsable', description: 'Filtrar por ID de responsable', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Lista de franjas horarias', type: [FranjaHoraria] })
  async findAllFranjasHorarias(
    @Query('dia') dia?: number,
    @Query('especialidad') especialidad?: number,
    @Query('responsable') responsable?: number
  ): Promise<FranjaHoraria[]> {
    if (dia && especialidad) {
      return this.horariosService.findFranjasByDiaYEspecialidad(+dia, +especialidad);
    }
    if (responsable) {
      return this.horariosService.findFranjasByResponsable(+responsable);
    }
    return this.horariosService.findAllFranjasHorarias();
  }

  @Get('franjas/:id')
  @ApiOperation({ 
    summary: 'Obtener franja horaria por ID',
    description: 'Recupera los detalles de una franja horaria específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la franja horaria', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Franja horaria encontrada', type: FranjaHoraria })
  @ApiResponse({ status: 404, description: 'Franja horaria no encontrada' })
  findOneFranjaHoraria(@Param('id', ParseIntPipe) id: number): Promise<FranjaHoraria> {
    return this.horariosService.findOneFranjaHoraria(id);
  }

  @Patch('franjas/:id')
  @ApiOperation({ 
    summary: 'Actualizar franja horaria',
    description: 'Modifica una franja horaria existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la franja horaria', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Franja horaria actualizada exitosamente', type: FranjaHoraria })
  @ApiResponse({ status: 404, description: 'Franja horaria no encontrada' })
  @ApiResponse({ status: 409, description: 'Se superpone con otra franja horaria existente' })
  updateFranjaHoraria(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFranjaHorariaDto: UpdateFranjaHorariaDto
  ): Promise<FranjaHoraria> {
    return this.horariosService.updateFranjaHoraria(id, updateFranjaHorariaDto);
  }

  @Delete('franjas/:id')
  @ApiOperation({ 
    summary: 'Eliminar franja horaria',
    description: 'Elimina una franja horaria del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la franja horaria', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Franja horaria eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Franja horaria no encontrada' })
  async removeFranjaHoraria(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.horariosService.removeFranjaHoraria(id);
    return { message: 'Franja horaria eliminada exitosamente' };
  }
}
