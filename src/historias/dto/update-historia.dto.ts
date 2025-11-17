import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHistoriaDto } from './create-historia.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CuestionarioCompletoDto } from './cuestionario.dto';

// Creamos un DTO específico para update sin circularidad
export class UpdateHistoriaDto {
  @ApiPropertyOptional({
    description: 'Cuestionario médico completo estructurado (RECOMENDADO)',
    type: () => CuestionarioCompletoDto
  })
  @ValidateNested()
  @Type(() => CuestionarioCompletoDto)
  @IsOptional()
  cuestionarioCompleto?: CuestionarioCompletoDto;

  @ApiPropertyOptional({
    description: 'Cuestionario simplificado (LEGACY)',
    example: {
      motivo_consulta: 'Control preventivo',
      antecedentes: {
        enfermedades: 'Ninguna',
        medicamentos: 'Ninguno'
      }
    }
  })
  @IsOptional()
  cuestionario?: any;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del profesional',
    example: 'Paciente requiere seguimiento post-tratamiento.'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}