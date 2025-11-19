import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadesController } from './especialidades.controller';
import { Especialidad } from '../entities/especialidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Especialidad])],
  controllers: [EspecialidadesController],
  providers: [EspecialidadesService],
  exports: [EspecialidadesService]
})
export class EspecialidadesModule {}
