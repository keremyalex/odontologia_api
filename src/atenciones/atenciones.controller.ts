import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AtencionesService } from './atenciones.service';
import { CreateAtencionDto, UpdateAtencionDto } from './dto/create-atencion.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('atenciones')
@ApiBearerAuth('access-token')
@Controller('atenciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AtencionesController {
  constructor(private readonly atencionesService: AtencionesService) {}

  @ApiOperation({
    summary: 'Atender una cita',
    description: 'Registra la atención de una cita programada. Solo docentes y estudiantes pueden atender citas.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Atención registrada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cita no está en estado programada o ya fue atendida'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita o historia clínica no encontrada'
  })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async create(@Body() createAtencionDto: CreateAtencionDto, @Req() req) {
    const atencion = await this.atencionesService.create(createAtencionDto, req.user.id);
    return {
      success: true,
      message: 'Atención registrada exitosamente',
      data: atencion
    };
  }

  @ApiOperation({
    summary: 'Listar todas las atenciones',
    description: 'Obtener lista completa de atenciones realizadas (solo admin y docentes)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de atenciones obtenida exitosamente'
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async findAll() {
    const atenciones = await this.atencionesService.findAll();
    return {
      success: true,
      data: atenciones
    };
  }

  @ApiOperation({
    summary: 'Obtener atenciones por paciente',
    description: 'Listar todas las atenciones de un paciente específico'
  })
  @ApiParam({
    name: 'pacienteId',
    description: 'ID del paciente',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atenciones del paciente obtenidas exitosamente'
  })
  @Get('paciente/:pacienteId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async findByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    const atenciones = await this.atencionesService.findByPaciente(pacienteId);
    return {
      success: true,
      data: atenciones
    };
  }

  @ApiOperation({
    summary: 'Obtener atenciones por historia clínica',
    description: 'Listar todas las atenciones de una historia clínica específica'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atenciones de la historia obtenidas exitosamente'
  })
  @Get('historia/:historiaId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async findByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    const atenciones = await this.atencionesService.findByHistoria(historiaId);
    return {
      success: true,
      data: atenciones
    };
  }

  @ApiOperation({
    summary: 'Obtener atención por cita',
    description: 'Obtener la atención registrada para una cita específica'
  })
  @ApiParam({
    name: 'citaId',
    description: 'ID de la cita',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atención de la cita obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró atención para esta cita'
  })
  @Get('cita/:citaId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.RECEPCION)
  async findByCita(@Param('citaId', ParseIntPipe) citaId: number) {
    const atencion = await this.atencionesService.findByCita(citaId);
    return {
      success: true,
      data: atencion
    };
  }

  @ApiOperation({
    summary: 'Obtener mis atenciones',
    description: 'Listar todas las atenciones realizadas por el usuario logueado'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atenciones del usuario obtenidas exitosamente'
  })
  @Get('mis-atenciones')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async findMisAtenciones(@Req() req) {
    const atenciones = await this.atencionesService.findByDocenteEstudiante(req.user.id);
    return {
      success: true,
      data: atenciones
    };
  }

  @ApiOperation({
    summary: 'Obtener estadísticas de atenciones',
    description: 'Obtener estadísticas generales de atenciones (solo admin y docentes)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @Get('estadisticas')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async getEstadisticas() {
    const estadisticas = await this.atencionesService.getEstadisticas();
    return {
      success: true,
      data: estadisticas
    };
  }

  @ApiOperation({
    summary: 'Obtener atención por ID',
    description: 'Obtener una atención específica con todos sus detalles'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la atención',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atención obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atención no encontrada'
  })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE, UserRole.RECEPCION)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const atencion = await this.atencionesService.findOne(id);
    return {
      success: true,
      data: atencion
    };
  }

  @ApiOperation({
    summary: 'Actualizar atención',
    description: 'Modificar los datos de una atención existente. Solo quien atendió puede modificar.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la atención a actualizar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atención actualizada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para modificar esta atención'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atención no encontrada'
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAtencionDto: UpdateAtencionDto,
    @Req() req
  ) {
    const atencion = await this.atencionesService.update(id, updateAtencionDto, req.user.id);
    return {
      success: true,
      message: 'Atención actualizada exitosamente',
      data: atencion
    };
  }

  @ApiOperation({
    summary: 'Eliminar atención',
    description: 'Eliminar una atención y restaurar la cita a estado programada. Solo quien atendió puede eliminar.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la atención a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Atención eliminada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para eliminar esta atención'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Atención no encontrada'
  })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.atencionesService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Atención eliminada exitosamente'
    };
  }
}