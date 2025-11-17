import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AdjuntosService } from './adjuntos.service';
import { AdjuntosController } from './adjuntos.controller';
import { Adjunto } from '../entities/adjunto.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Adjunto]),
    AuditoriaModule,
    MulterModule.register({
      dest: './uploads/adjuntos',
    }),
  ],
  controllers: [AdjuntosController],
  providers: [AdjuntosService],
  exports: [AdjuntosService],
})
export class AdjuntosModule {}