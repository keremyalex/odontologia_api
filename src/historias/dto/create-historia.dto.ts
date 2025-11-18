import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuestionarioCompletoDto, CuestionarioDirectDto } from './cuestionario.dto';
import { CuestionarioOdontologicoDto } from './cuestionario-odontologico.dto';

// DTO simplificado para compatibilidad con versiones anteriores
class CuestionarioSimplificadoDto {
  @ApiPropertyOptional({
    description: 'Motivo principal de la consulta (versión legacy)',
    example: 'Dolor intenso en muela del juicio'
  })
  @IsOptional()
  @IsString()
  motivo_consulta?: string;

  @ApiPropertyOptional({
    description: 'Antecedentes médicos (versión legacy)',
    example: {
      enfermedades: 'Hipertensión arterial',
      medicamentos: 'Losartán 50mg',
      alergias: 'Penicilina',
      cirugias: 'Apendicectomía (2015)'
    }
  })
  @IsOptional()
  antecedentes?: any;

  @ApiPropertyOptional({
    description: 'Examen clínico (versión legacy)',
    example: {
      estado_general: 'Paciente consciente',
      presion_arterial: '120/80 mmHg'
    }
  })
  @IsOptional()
  examen_clinico?: any;
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
    description: 'Cuestionario médico con valores directos (FORMATO SIMPLIFICADO)',
    type: CuestionarioDirectDto,
    example: {
      antecedentesFamiliares: {
        padreConVida: true,
        enfermedadPadre: 'Hipertensión arterial',
        madreConVida: true,
        enfermedadMadre: null,
        hermanos: { respuesta: true, detalle: 'Dos hermanos sanos' }
      },
      habitosYAntecedentesMedicos: {
        realizaDeporte: true,
        malestarDeporte: false,
        alergiaDroga: false,
        alergiaAnestesia: false,
        esDiabetico: null,
        medicoClinico: 'Dr. José Pérez'
      }
    }
  })
  @ValidateNested()
  @Type(() => CuestionarioDirectDto)
  @IsOptional()
  cuestionario?: CuestionarioDirectDto;

  @ApiProperty({
    description: 'Cuestionario médico completo estructurado (FORMATO COMPLETO)',
    type: CuestionarioCompletoDto,
    example: {
      antecedentesFamiliares: {
        padreConVida: { respuesta: true },
        enfermedadPadre: { respuesta: 'Hipertensión arterial' },
        madreConVida: { respuesta: true },
        enfermedadMadre: { respuesta: 'Diabetes tipo 2' },
        hermanos: { respuesta: true, detalle: 'Dos hermanos sanos' }
      },
      habitosYAntecedentesMedicos: {
        realizaDeporte: { respuesta: true },
        alergiaPenicilina: { respuesta: true },
        esDiabetico: { respuesta: false },
        presionAlta: { respuesta: false },
        fuma: { respuesta: false }
      }
    }
  })
  @ValidateNested()
  @Type(() => CuestionarioCompletoDto)
  @IsOptional()
  cuestionarioCompleto?: CuestionarioCompletoDto;

  @ApiProperty({
    description: 'Cuestionario odontológico específico',
    type: CuestionarioOdontologicoDto,
    example: {
      por_que_asistio_a_la_consulta: "Dolor en muela",
      consulto_antes_con_algun_otro_profesional: true,
      dolor: {
        ha_tenido_dolor: true,
        dolor_tipo_intensidad: ["Intenso"],
        dolor_frecuencia: ["Continuo"],
        dolor_provocado: ["Al frío"],
        dolor_irradiado: false
      },
      le_sangran_las_encias: false,
      tiene_movilidad_en_sus_dientes: false,
      estado_de_la_higiene_bucal: "Bueno"
    }
  })
  @ValidateNested()
  @Type(() => CuestionarioOdontologicoDto)
  @IsOptional()
  cuestionarioOdontologico?: CuestionarioOdontologicoDto;
}