import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from '../entities/cita.entity';
import { FranjaHoraria } from '../entities/franja-horaria.entity';
import { Paciente } from '../entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, FranjaHoraria, Paciente])],
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService]
})
export class CitasModule {}
