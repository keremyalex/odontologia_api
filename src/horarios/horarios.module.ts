import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { HorarioClinica } from '../entities/horario-clinica.entity';
import { FranjaHoraria } from '../entities/franja-horaria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HorarioClinica, FranjaHoraria])],
  controllers: [HorariosController],
  providers: [HorariosService],
  exports: [HorariosService]
})
export class HorariosModule {}
