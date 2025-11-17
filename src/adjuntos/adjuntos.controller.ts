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
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiConsumes, 
  ApiBody 
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AdjuntosService } from './adjuntos.service';
import { CreateAdjuntoDto, TipoAdjunto } from './dto/create-adjunto.dto';
import { UpdateAdjuntoDto } from './dto/update-adjunto.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('adjuntos')
@ApiBearerAuth('access-token')
@Controller('adjuntos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdjuntosController {
  constructor(private readonly adjuntosService: AdjuntosService) {}

  @ApiOperation({
    summary: 'Subir archivo adjunto',
    description: 'Subir archivo médico (radiografías, fotos, documentos) con validación de tipo y tamaño'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo y metadatos',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (máximo 5MB)'
        },
        historiaId: {
          type: 'number',
          description: 'ID de la historia clínica',
          example: 1
        },
        nombreOriginal: {
          type: 'string',
          description: 'Nombre descriptivo del archivo',
          example: 'Radiografía panorámica'
        },
        tipo: {
          type: 'string',
          enum: Object.values(TipoAdjunto),
          description: 'Tipo de adjunto médico'
        },
        descripcion: {
          type: 'string',
          description: 'Descripción del archivo',
          example: 'Radiografía inicial para evaluación'
        }
      },
      required: ['file', 'historiaId', 'nombreOriginal', 'tipo']
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Archivo subido exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Archivo inválido (tipo no permitido o muy grande)'
  })
  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      // Permitir imágenes, PDFs y documentos comunes
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Tipo de archivo no permitido'), false);
      }
    },
  }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAdjuntoDto: CreateAdjuntoDto,
    @Req() req,
  ) {
    return this.adjuntosService.upload(file, createAdjuntoDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Listar todos los adjuntos',
    description: 'Obtener lista completa de archivos adjuntos del sistema'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de adjuntos obtenida exitosamente'
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findAll() {
    return this.adjuntosService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener adjuntos por historia',
    description: 'Listar todos los archivos adjuntos de una historia clínica específica'
  })
  @ApiParam({
    name: 'historiaId',
    description: 'ID de la historia clínica',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Adjuntos de la historia obtenidos exitosamente'
  })
  @Get('historia/:historiaId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findByHistoria(@Param('historiaId', ParseIntPipe) historiaId: number) {
    return this.adjuntosService.findByHistoria(historiaId);
  }

  @ApiOperation({
    summary: 'Obtener información del adjunto',
    description: 'Obtener metadatos de un archivo adjunto específico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del adjunto',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Información del adjunto obtenida exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Adjunto no encontrado'
  })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adjuntosService.findOne(id);
  }

  @ApiOperation({
    summary: 'Descargar archivo',
    description: 'Descargar el archivo físico del adjunto'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del adjunto a descargar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo descargado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Archivo no encontrado o fue eliminado'
  })
  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { buffer, filename, mimetype } = await this.adjuntosService.download(id);
    
    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    res.send(buffer);
  }

  @ApiOperation({
    summary: 'Actualizar metadatos del adjunto',
    description: 'Modificar descripción y tipo del archivo (no el archivo físico)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del adjunto a actualizar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Metadatos actualizados exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Adjunto no encontrado'
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.RECEPCION)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdjuntoDto: UpdateAdjuntoDto,
    @Req() req,
  ) {
    return this.adjuntosService.update(id, updateAdjuntoDto, req.user.id);
  }

  @ApiOperation({
    summary: 'Eliminar adjunto',
    description: 'Eliminar permanentemente un adjunto y su archivo físico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del adjunto a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Adjunto eliminado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Adjunto no encontrado'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permisos insuficientes para eliminar'
  })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adjuntosService.remove(id, req.user.id);
  }
}