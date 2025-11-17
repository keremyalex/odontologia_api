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
import { HistoriasService } from './historias.service';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { UpdateHistoriaDto } from './dto/update-historia.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('historias')
@ApiBearerAuth('access-token')
@Controller('historias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistoriasController {
  constructor(private readonly historiasService: HistoriasService) {}

  @ApiOperation({
    summary: 'Crear nueva historia clínica',
    description: 'Crear una nueva historia clínica para un paciente con cuestionario completo'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Historia clínica creada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado'
  })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  create(@Body() createHistoriaDto: CreateHistoriaDto, @Req() req) {
    return this.historiasService.create(createHistoriaDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Listar todas las historias clínicas',
    description: 'Obtener lista completa de historias clínicas del sistema'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de historias clínicas obtenida exitosamente'
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findAll() {
    return this.historiasService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener historias de un paciente',
    description: 'Listar todas las historias clínicas de un paciente específico'
  })
  @ApiParam({
    name: 'pacienteId',
    description: 'ID del paciente',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historias del paciente obtenidas exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente no encontrado'
  })
  @Get('paciente/:pacienteId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findByPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    return this.historiasService.findByPaciente(pacienteId);
  }

  @ApiOperation({
    summary: 'Obtener historia clínica por ID',
    description: 'Obtener una historia clínica específica con todos sus detalles'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historia clínica obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Historia clínica no encontrada'
  })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historiasService.findOne(id);
  }

  @ApiOperation({
    summary: 'Obtener cuestionario médico estructurado',
    description: 'Obtener el template del cuestionario médico completo con todas las preguntas disponibles'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Template de cuestionario obtenido exitosamente',
    content: {
      'application/json': {
        example: {
          antecedentesFamiliares: [
            { pregunta: "Padre con vida?", tipo: "si_no" },
            { pregunta: "Enfermedad que padece o padeció (padre)", tipo: "texto" },
            { pregunta: "Hermanos?", tipo: "mixto", detalle: "Sanos?" }
          ],
          habitosYAntecedentesMedicos: [
            { pregunta: "Realiza algún deporte?", tipo: "si_no" },
            { pregunta: "Es alérgico a la penicilina?", tipo: "si_no" },
            { pregunta: "Está controlado?", tipo: "mixto", detalle: "Con qué?" }
          ]
        }
      }
    }
  })
  @Get('template/cuestionario')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async getCuestionarioTemplate() {
    return this.historiasService.getCuestionarioTemplate();
  }

  @ApiOperation({
    summary: 'Actualizar historia clínica',
    description: 'Modificar los datos de una historia clínica existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la historia clínica a actualizar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historia clínica actualizada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Historia clínica no encontrada'
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistoriaDto: UpdateHistoriaDto,
    @Req() req,
  ) {
    return this.historiasService.update(id, updateHistoriaDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Eliminar historia clínica',
    description: 'Eliminar permanentemente una historia clínica (solo admin y docentes)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la historia clínica a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Historia clínica eliminada exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Historia clínica no encontrada'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permisos insuficientes para eliminar'
  })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.historiasService.remove(id, req.user.id);
  }
}