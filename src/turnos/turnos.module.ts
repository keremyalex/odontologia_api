import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from '../entities/turno.entity';
import { Paciente } from '../entities/paciente.entity';
import { User } from '../entities/user.entity';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Paciente, User])],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService],
})
export class TurnosModule {}