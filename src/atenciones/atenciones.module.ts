import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtencionesService } from './atenciones.service';
import { AtencionesController } from './atenciones.controller';
import { Atencion } from '../entities/atencion.entity';
import { Cita } from '../entities/cita.entity';
import { Historia } from '../entities/historia.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Atencion, Cita, Historia]),
    AuditoriaModule,
  ],
  controllers: [AtencionesController],
  providers: [AtencionesService],
  exports: [AtencionesService],
})
export class AtencionesModule {}