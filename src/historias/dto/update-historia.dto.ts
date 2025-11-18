import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHistoriaDto } from './create-historia.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CuestionarioCompletoDto, CuestionarioDirectDto } from './cuestionario.dto';
import { CuestionarioOdontologicoDto } from './cuestionario-odontologico.dto';

// Creamos un DTO específico para update sin circularidad
export class UpdateHistoriaDto {
  @ApiPropertyOptional({
    description: 'Cuestionario médico con valores directos (FORMATO SIMPLIFICADO)',
    type: () => CuestionarioDirectDto
  })
  @ValidateNested()
  @Type(() => CuestionarioDirectDto)
  @IsOptional()
  cuestionario?: CuestionarioDirectDto;

  @ApiPropertyOptional({
    description: 'Cuestionario médico completo estructurado (FORMATO COMPLETO)',
    type: () => CuestionarioCompletoDto
  })
  @ValidateNested()
  @Type(() => CuestionarioCompletoDto)
  @IsOptional()
  cuestionarioCompleto?: CuestionarioCompletoDto;

  @ApiPropertyOptional({
    description: 'Cuestionario odontológico específico',
    type: () => CuestionarioOdontologicoDto
  })
  @ValidateNested()
  @Type(() => CuestionarioOdontologicoDto)
  @IsOptional()
  cuestionarioOdontologico?: CuestionarioOdontologicoDto;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del profesional',
    example: 'Paciente requiere seguimiento post-tratamiento.'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}