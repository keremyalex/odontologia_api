import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriasService } from './historias.service';
import { HistoriasController } from './historias.controller';
import { Historia } from '../entities/historia.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Historia]),
    AuditoriaModule,
  ],
  controllers: [HistoriasController],
  providers: [HistoriasService],
  exports: [HistoriasService],
})
export class HistoriasModule {}