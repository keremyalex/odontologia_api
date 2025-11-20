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
import { OdontogramasService } from './odontogramas.service';
import { CreateOdontogramaDto, UpdateOdontogramaObservacionesDto } from './dto/create-odontograma.dto';
import { UpdateOdontogramaDto } from './dto/update-odontograma.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('odontogramas')
@ApiBearerAuth('access-token')
@Controller('odontogramas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OdontogramasController {
  constructor(private readonly odontogramasService: OdontogramasService) {}

  @ApiOperation({
    summary: 'Crear nuevo odontograma',
    description: 'Crear un nuevo odontograma con versionado automático (versión = max + 1)'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Odontograma creado exitosamente con nueva versión'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Historia clínica no encontrada'
  })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  create(@Body() createOdontogramaDto: CreateOdontogramaDto, @Req() req) {
    return this.odontogramasService.create(createOdontogramaDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Listar todos los odontogramas',
    description: 'Obtener lista completa de odontogramas ordenados por fecha y versión'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de odontogramas obtenida exitosamente'
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findAll() {
    return this.odontogramasService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener odontogramas por historia',
    description: 'Listar todas las versiones de odontogramas de una historia clínica específica'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Odontogramas de la historia obtenidos exitosamente'
  })
  @Get('historia/:historiaId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async findByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    const odontogramas = await this.odontogramasService.findByHistoria(historiaId);
    return {
      success: true,
      data: odontogramas.map(o => ({
        ...o,
        dientes: o.getDientes()
      }))
    };
  }

  @ApiOperation({
    summary: 'Obtener última versión del odontograma',
    description: 'Obtener la versión más reciente del odontograma de una historia clínica'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Última versión del odontograma obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontró odontograma para esta historia'
  })
  @Get('historia/:historiaId/latest')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async findLatestByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    const odontograma = await this.odontogramasService.findLatestByHistoria(historiaId);
    return {
      success: true,
      data: {
        ...odontograma,
        dientes: odontograma.getDientes() // Deserializar JSON para el frontend
      }
    };
  }

  @ApiOperation({
    summary: 'Obtener odontograma por ID',
    description: 'Obtener un odontograma específico con todos sus detalles'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del odontograma',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Odontograma obtenido exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Odontograma no encontrado'
  })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const odontograma = await this.odontogramasService.findOne(id);
    return {
      success: true,
      data: {
        ...odontograma,
        dientes: odontograma.getDientes()
      }
    };
  }

  @ApiOperation({
    summary: 'Actualizar observaciones del odontograma',
    description: 'Modificar solo las observaciones (para cambios en datos, crear nueva versión)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del odontograma a actualizar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Observaciones actualizadas exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Odontograma no encontrado'
  })
  @Patch(':id/observaciones')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  updateObservaciones(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateOdontogramaObservacionesDto, @Req() req) {
    return this.odontogramasService.updateObservaciones(id, updateDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Guardar/Actualizar odontograma completo',
    description: 'Guardar el estado completo del odontograma desde el frontend. Si no existe, crea uno nuevo; si existe, crea una nueva versión.'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Odontograma guardado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nuevo odontograma creado exitosamente'
  })
  @Post('historia/:historiaId/guardar')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  async guardarOdontograma(
    @Param('historiaId', ParseIntPipe) historiaId: number,
    @Body() odontogramaData: { dientes: any[], observaciones?: string },
    @Req() req
  ) {
    // Preparar DTO para crear odontograma
    const createDto: CreateOdontogramaDto = {
      historiaId,
      fecha: new Date().toISOString().split('T')[0],
      dientes: odontogramaData.dientes,
      observaciones: odontogramaData.observaciones || ''
    };

    const odontograma = await this.odontogramasService.create(createDto, req.user.id);
    
    return {
      success: true,
      data: {
        ...odontograma,
        dientes: odontograma.getDientes()
      }
    };
  }

  @ApiOperation({
    summary: 'Obtener estadísticas del odontograma',
    description: 'Obtener estadísticas detalladas del estado dental de una historia clínica'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @Get('historia/:historiaId/estadisticas')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async obtenerEstadisticas(@Param('historiaId', ParseIntPipe) historiaId: number) {
    const estadisticas = await this.odontogramasService.obtenerEstadisticas(historiaId);
    return {
      success: true,
      data: estadisticas
    };
  }

  @ApiOperation({
    summary: 'Actualizar odontograma completo (crear nueva versión)',
    description: 'Crear una nueva versión del odontograma con cambios completos'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del odontograma base',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nueva versión del odontograma creada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Odontograma no encontrado'
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOdontogramaDto: UpdateOdontogramaDto,
    @Req() req,
  ) {
    return this.odontogramasService.update(id, updateOdontogramaDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Eliminar odontograma',
    description: 'Eliminar permanentemente un odontograma (solo admin y docentes)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del odontograma a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Odontograma eliminado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Odontograma no encontrado'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permisos insuficientes para eliminar'
  })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.odontogramasService.remove(id, req.user.id);
  }
}