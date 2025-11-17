import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria, AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrarAccion(
    tabla: string,
    registroId: number,
    accion: AccionAuditoria,
    datosAnteriores: any = null,
    datosNuevos: any = null,
    usuarioId?: number,
  ): Promise<void> {
    try {
      const auditoria = this.auditoriaRepository.create({
        tabla,
        registroId,
        accion,
        datosAnteriores,
        datosNuevos,
        usuarioId,
      });

      await this.auditoriaRepository.save(auditoria);
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      // No lanzamos el error para no interrumpir la operación principal
    }
  }

  async obtenerHistorial(tabla: string, registroId: number): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: { tabla, registroId },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }
}