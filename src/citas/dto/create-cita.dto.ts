import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CitaEstado } from '../../entities/cita.entity';

export class CreateCitaDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pacienteId: number;

  @ApiProperty({
    description: 'ID de la franja horaria',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  franjaId: number;

  @ApiProperty({
    description: 'Fecha de la cita (formato YYYY-MM-DD)',
    example: '2025-11-20'
  })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Hora de inicio (formato HH:MM)',
    example: '09:00'
  })
  @IsNotEmpty()
  @IsString()
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin (formato HH:MM)',
    example: '09:30'
  })
  @IsNotEmpty()
  @IsString()
  horaFin: string;

  @ApiPropertyOptional({
    description: 'Estado de la cita',
    enum: CitaEstado,
    example: CitaEstado.PROGRAMADA,
    default: CitaEstado.PROGRAMADA
  })
  @IsOptional()
  @IsEnum(CitaEstado)
  estado?: CitaEstado;

  @ApiPropertyOptional({
    description: 'Motivo de la consulta',
    example: 'Dolor en muela del juicio'
  })
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Paciente con alergia a la penicilina'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

// DTO específico para reagendar citas
export class ReagendarCitaDto {
  @ApiProperty({
    description: 'ID de la nueva franja horaria',
    example: 2
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  franjaId: number;

  @ApiProperty({
    description: 'Nueva fecha de la cita (formato YYYY-MM-DD)',
    example: '2025-11-25'
  })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Nueva hora de inicio (formato HH:MM)',
    example: '10:00'
  })
  @IsNotEmpty()
  @IsString()
  horaInicio: string;

  @ApiProperty({
    description: 'Nueva hora de fin (formato HH:MM)',
    example: '10:30'
  })
  @IsNotEmpty()
  @IsString()
  horaFin: string;

  @ApiPropertyOptional({
    description: 'Motivo del reagendamiento',
    example: 'Conflicto de horarios del paciente'
  })
  @IsOptional()
  @IsString()
  motivoReagendamiento?: string;
}

// DTO para cambiar estado de cita
export class CambiarEstadoCitaDto {
  @ApiProperty({
    description: 'Nuevo estado de la cita',
    enum: CitaEstado,
    example: CitaEstado.ATENDIDA
  })
  @IsNotEmpty()
  @IsEnum(CitaEstado)
  estado: CitaEstado;

  @ApiPropertyOptional({
    description: 'Observaciones sobre el cambio de estado',
    example: 'Paciente atendido satisfactoriamente'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
