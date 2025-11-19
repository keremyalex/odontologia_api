import { PartialType } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CitaEstado } from '../../entities/cita.entity';
import { Type } from 'class-transformer';

export class UpdateCitaDto {
  @ApiPropertyOptional({
    description: 'ID de la franja horaria',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  franjaId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de la cita (formato YYYY-MM-DD)',
    example: '2025-11-20'
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Hora de inicio (formato HH:MM)',
    example: '09:00'
  })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional({
    description: 'Hora de fin (formato HH:MM)',
    example: '09:30'
  })
  @IsOptional()
  @IsString()
  horaFin?: string;

  @ApiPropertyOptional({
    description: 'Estado de la cita',
    enum: CitaEstado,
    example: CitaEstado.PROGRAMADA
  })
  @IsOptional()
  @IsEnum(CitaEstado)
  estado?: CitaEstado;

  @ApiPropertyOptional({
    description: 'Motivo de la consulta',
    example: 'Revisión de rutina'
  })
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Paciente llegó 10 minutos tarde'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
