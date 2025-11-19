import { IsNotEmpty, IsArray, IsString, IsBoolean, IsOptional, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateHorarioClinicaDto {
  @ApiProperty({
    description: 'Días de la semana de operación (1=Lunes, 2=Martes, ..., 7=Domingo)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    minItems: 1,
    maxItems: 7
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @Type(() => Number)
  @Transform(({ value }) => value.map((day: any) => parseInt(day)))
  diasSemana: number[];

  @ApiProperty({
    description: 'Hora de apertura (formato HH:MM)',
    example: '07:00'
  })
  @IsNotEmpty()
  @IsString()
  horaApertura: string;

  @ApiProperty({
    description: 'Hora de cierre (formato HH:MM)',
    example: '21:00'
  })
  @IsNotEmpty()
  @IsString()
  horaCierre: string;

  @ApiPropertyOptional({
    description: 'Si el horario está activo',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Descripción del horario',
    example: 'Horario habitual de la clínica'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
