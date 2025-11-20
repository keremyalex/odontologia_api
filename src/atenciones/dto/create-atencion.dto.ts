import { IsNotEmpty, IsNumber, IsString, IsOptional, IsObject, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EstadoBucalGeneralDto {
  @ApiProperty({ example: true, description: 'Indica si hay presencia de sarro' })
  @IsBoolean()
  presenciaSarro: boolean;

  @ApiProperty({ example: false, description: 'Indica si hay enfermedad periodontal' })
  @IsBoolean()
  enfermedadPeriodontal: boolean;

  @ApiProperty({ 
    enum: ['muy_bueno', 'bueno', 'deficiente', 'malo'], 
    example: 'bueno',
    description: 'Estado de la higiene bucal'
  })
  @IsString()
  @IsIn(['muy_bueno', 'bueno', 'deficiente', 'malo'])
  higieneBucal: string;

  @ApiPropertyOptional({ example: 'Observaciones adicionales del estado bucal' })
  @IsOptional()
  @IsString()
  otros?: string;
}



export class CreateAtencionDto {
  @ApiProperty({ example: 1, description: 'ID de la cita a atender' })
  @IsNotEmpty()
  @IsNumber()
  citaId: number;

  @ApiProperty({ 
    example: 'Caries dental múltiple',
    description: 'Diagnóstico presuntivo del paciente'
  })
  @IsNotEmpty()
  @IsString()
  diagnosticoPresuntivo: string;

  @ApiProperty({ 
    example: 'Obturaciones en piezas 1.6, 2.4 y profilaxis general',
    description: 'Plan de tratamiento propuesto'
  })
  @IsNotEmpty()
  @IsString()
  planTratamiento: string;

  @ApiPropertyOptional({ 
    example: 'Paciente colaborador, requiere seguimiento en 1 mes',
    description: 'Observaciones adicionales de la atención'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ 
    type: EstadoBucalGeneralDto,
    description: 'Estado bucal general del paciente'
  })
  @ValidateNested()
  @Type(() => EstadoBucalGeneralDto)
  estadoBucalGeneral: EstadoBucalGeneralDto;
}

export class UpdateAtencionDto {
  @ApiPropertyOptional({ 
    example: 'Caries dental múltiple - actualizado',
    description: 'Diagnóstico presuntivo actualizado'
  })
  @IsOptional()
  @IsString()
  diagnosticoPresuntivo?: string;

  @ApiPropertyOptional({ 
    example: 'Plan modificado: Endodoncia en pieza 1.6',
    description: 'Plan de tratamiento actualizado'
  })
  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @ApiPropertyOptional({ 
    example: 'Observaciones actualizadas',
    description: 'Observaciones modificadas'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ 
    type: EstadoBucalGeneralDto,
    description: 'Estado bucal general actualizado'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EstadoBucalGeneralDto)
  estadoBucalGeneral?: EstadoBucalGeneralDto;
}