import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adjunto } from '../entities/adjunto.entity';
import { CreateAdjuntoDto } from './dto/create-adjunto.dto';
import { UpdateAdjuntoDto } from './dto/update-adjunto.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdjuntosService {
  private readonly uploadPath = './uploads/adjuntos';

  constructor(
    @InjectRepository(Adjunto)
    private adjuntoRepository: Repository<Adjunto>,
    private auditoriaService: AuditoriaService,
  ) {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    createAdjuntoDto: CreateAdjuntoDto,
    usuarioId: number,
  ): Promise<Adjunto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo supera el tamaño máximo permitido de 5MB');
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
    const filepath = path.join(this.uploadPath, filename);

    try {
      // Guardar archivo en el sistema de archivos
      fs.writeFileSync(filepath, file.buffer);

      // Crear registro en base de datos
      const adjunto = this.adjuntoRepository.create({
        ...createAdjuntoDto,
        nombreArchivo: filename,
        rutaArchivo: filepath,
        tipoMime: file.mimetype,
        tamano: file.size,
        creadoPor: usuarioId,
      });

      const savedAdjunto = await this.adjuntoRepository.save(adjunto);
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        'adjuntos',
        Array.isArray(savedAdjunto) ? savedAdjunto[0]?.id : savedAdjunto.id,
        AccionAuditoria.INSERT,
        null,
        savedAdjunto,
        usuarioId,
      );

      return this.findOne(Array.isArray(savedAdjunto) ? savedAdjunto[0]?.id : savedAdjunto.id);
    } catch (error) {
      // Si falla el guardado en BD, eliminar el archivo
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      throw new InternalServerErrorException('Error al guardar el archivo');
    }
  }

  async findAll(): Promise<Adjunto[]> {
    return this.adjuntoRepository.find({
      relations: ['historia', 'creador'],
      order: { fechaSubida: 'DESC' },
    });
  }

  async findByHistoria(historiaId: number): Promise<Adjunto[]> {
    return this.adjuntoRepository.find({
      where: { historiaId },
      relations: ['historia', 'creador'],
      order: { fechaSubida: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Adjunto> {
    const adjunto = await this.adjuntoRepository.findOne({
      where: { id },
      relations: ['historia', 'creador'],
    });

    if (!adjunto) {
      throw new NotFoundException(`Adjunto con ID ${id} no encontrado`);
    }

    return adjunto;
  }

  async download(id: number): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const adjunto = await this.findOne(id);

    if (!fs.existsSync(adjunto.rutaArchivo)) {
      throw new NotFoundException('El archivo físico no existe');
    }

    const buffer = fs.readFileSync(adjunto.rutaArchivo);
    return {
      buffer,
      filename: adjunto.nombreOriginal,
      mimetype: adjunto.tipoMime,
    };
  }

  async update(id: number, updateAdjuntoDto: UpdateAdjuntoDto, usuarioId: number): Promise<Adjunto> {
    const adjuntoAnterior = await this.findOne(id);
    
    // Solo permitir actualizar descripción y tipo
    const adjuntoActualizado = this.adjuntoRepository.merge(adjuntoAnterior, {
      ...(updateAdjuntoDto.descripcion && { descripcion: updateAdjuntoDto.descripcion }),
      ...(updateAdjuntoDto.tipo && { tipo: updateAdjuntoDto.tipo }),
    });

    const adjuntoNuevo = await this.adjuntoRepository.save(adjuntoActualizado);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'adjuntos',
      id,
      AccionAuditoria.UPDATE,
      adjuntoAnterior,
      adjuntoNuevo,
      usuarioId,
    );

    return adjuntoNuevo;
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const adjunto = await this.findOne(id);
    
    // Eliminar archivo físico
    if (fs.existsSync(adjunto.rutaArchivo)) {
      fs.unlinkSync(adjunto.rutaArchivo);
    }

    await this.adjuntoRepository.remove(adjunto);
    
    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      'adjuntos',
      id,
      AccionAuditoria.DELETE,
      adjunto,
      null,
      usuarioId,
    );
  }
}