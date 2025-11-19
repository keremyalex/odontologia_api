import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFranjaHorariaDto {
  @ApiProperty({
    description: 'Día de la semana (1=Lunes, 2=Martes, ..., 7=Domingo)',
    example: 1,
    minimum: 1,
    maximum: 7
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(7)
  diaSemana: number;

  @ApiProperty({
    description: 'ID de la especialidad',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  especialidadId: number;

  @ApiProperty({
    description: 'ID del usuario responsable (docente)',
    example: 45
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  responsableId: number;

  @ApiProperty({
    description: 'Hora de inicio (formato HH:MM)',
    example: '08:00'
  })
  @IsNotEmpty()
  @IsString()
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin (formato HH:MM)',
    example: '10:00'
  })
  @IsNotEmpty()
  @IsString()
  horaFin: string;

  @ApiPropertyOptional({
    description: 'Duración de cada cita en minutos',
    example: 30,
    default: 30
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(15)
  @Max(120)
  duracionCitaMin?: number;

  @ApiPropertyOptional({
    description: 'Estado de la franja horaria',
    example: 'activo',
    enum: ['activo', 'inactivo', 'suspendido'],
    default: 'activo'
  })
  @IsOptional()
  @IsString()
  @IsIn(['activo', 'inactivo', 'suspendido'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Franja especial para tratamientos complejos'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
