import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { Especialidad } from '../entities/especialidad.entity';

@ApiTags('Especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear una nueva especialidad',
    description: 'Registra una nueva especialidad médica en el sistema'
  })
  @ApiResponse({ status: 201, description: 'Especialidad creada exitosamente', type: Especialidad })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una especialidad con ese nombre' })
  create(@Body() createEspecialidadDto: CreateEspecialidadDto): Promise<Especialidad> {
    return this.especialidadesService.create(createEspecialidadDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las especialidades',
    description: 'Recupera la lista de todas las especialidades con sus franjas horarias'
  })
  @ApiResponse({ status: 200, description: 'Lista de especialidades obtenida exitosamente', type: [Especialidad] })
  findAll(): Promise<Especialidad[]> {
    return this.especialidadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener una especialidad por ID',
    description: 'Recupera los detalles de una especialidad específica incluyendo sus franjas horarias'
  })
  @ApiParam({ name: 'id', description: 'ID de la especialidad', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidad encontrada', type: Especialidad })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Especialidad> {
    return this.especialidadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar una especialidad',
    description: 'Modifica los datos de una especialidad existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la especialidad', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidad actualizada exitosamente', type: Especialidad })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una especialidad con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateEspecialidadDto: UpdateEspecialidadDto
  ): Promise<Especialidad> {
    return this.especialidadesService.update(id, updateEspecialidadDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar una especialidad',
    description: 'Elimina una especialidad del sistema (solo si no tiene franjas horarias asociadas)'
  })
  @ApiParam({ name: 'id', description: 'ID de la especialidad', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidad eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Especialidad no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar: tiene franjas horarias asociadas' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.especialidadesService.remove(id);
    return { message: 'Especialidad eliminada exitosamente' };
  }
}
