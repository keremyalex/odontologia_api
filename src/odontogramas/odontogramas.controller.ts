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
import { CreateOdontogramaDto } from './dto/create-odontograma.dto';
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
  findByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    return this.odontogramasService.findByHistoria(historiaId);
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
  findLatestByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    return this.odontogramasService.findLatestByHistoria(historiaId);
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.odontogramasService.findOne(id);
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