import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MotivoConsultaDto {
  @ApiProperty({
    description: 'Motivo principal de la consulta',
    example: 'Dolor en muela del juicio inferior derecha'
  })
  @IsString()
  @IsNotEmpty()
  motivo_consulta: string;
}

class AntecedentesDto {
  @ApiPropertyOptional({
    description: 'Antecedentes médicos del paciente',
    example: 'Hipertensión arterial, diabetes tipo 2'
  })
  @IsOptional()
  @IsString()
  enfermedades?: string;

  @ApiPropertyOptional({
    description: 'Medicamentos que toma actualmente',
    example: 'Losartán 50mg, Metformina 850mg'
  })
  @IsOptional()
  @IsString()
  medicamentos?: string;

  @ApiPropertyOptional({
    description: 'Alergias conocidas del paciente',
    example: 'Penicilina, ácaros'
  })
  @IsOptional()
  @IsString()
  alergias?: string;

  @ApiPropertyOptional({
    description: 'Antecedentes quirúrgicos',
    example: 'Apendicectomía (2015), colecistectomía (2020)'
  })
  @IsOptional()
  @IsString()
  cirugias?: string;
}

class ExamenClinicoDto {
  @ApiPropertyOptional({
    description: 'Estado general del paciente',
    example: 'Paciente consciente, orientado, colaborador'
  })
  @IsOptional()
  @IsString()
  estado_general?: string;

  @ApiPropertyOptional({
    description: 'Presión arterial del paciente',
    example: '120/80 mmHg'
  })
  @IsOptional()
  @IsString()
  presion_arterial?: string;

  @ApiPropertyOptional({
    description: 'Pulso del paciente',
    example: '72 latidos por minuto'
  })
  @IsOptional()
  @IsString()
  pulso?: string;

  @ApiPropertyOptional({
    description: 'Temperatura corporal',
    example: '36.5°C'
  })
  @IsOptional()
  @IsString()
  temperatura?: string;
}

export class CuestionarioDto {
  @ApiProperty({
    description: 'Motivo principal de la consulta (obligatorio)',
    type: MotivoConsultaDto,
    example: {
      motivo_consulta: 'Dolor intenso en muela del juicio'
    }
  })
  @ValidateNested()
  @Type(() => MotivoConsultaDto)
  @IsNotEmpty()
  motivo_consulta: string; // Requerido según las reglas

  @ApiPropertyOptional({
    description: 'Antecedentes médicos del paciente',
    type: AntecedentesDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AntecedentesDto)
  antecedentes?: AntecedentesDto;

  @ApiPropertyOptional({
    description: 'Resultados del examen clínico',
    type: ExamenClinicoDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExamenClinicoDto)
  examen_clinico?: ExamenClinicoDto;

  @ApiPropertyOptional({
    description: 'Datos del odontograma si se incluyen',
    example: { diente_18: { estado: 'cariado', tratamiento: 'obturación' } }
  })
  @IsOptional()
  @IsObject()
  odontograma?: any; // Datos del odontograma si se incluyen

  @ApiPropertyOptional({
    description: 'Campos adicionales del formulario',
    example: { notas_especiales: 'Paciente ansioso' }
  })
  @IsOptional()
  @IsObject()
  otros?: any; // Campos adicionales del formulario
}

export class CreateHistoriaDto {
  @ApiProperty({
    description: 'ID del paciente al que pertenece la historia',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  pacienteId: number;

  @ApiProperty({
    description: 'Cuestionario completo de la historia clínica',
    type: CuestionarioDto
  })
  @ValidateNested()
  @Type(() => CuestionarioDto)
  @IsNotEmpty()
  cuestionario: CuestionarioDto;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del profesional',
    example: 'Paciente requiere seguimiento post-tratamiento'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}