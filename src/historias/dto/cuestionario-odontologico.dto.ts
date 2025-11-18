import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, ValidateNested, IsArray } from 'class-validator';

// DTOs para tipos de respuesta específicos del cuestionario odontológico
export class DolorDto {
  @ApiProperty({ description: '¿Ha tenido dolor?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  ha_tenido_dolor?: boolean | null;

  @ApiProperty({ 
    description: '¿De qué tipo de dolor?', 
    type: [String], 
    enum: ['Suave', 'Moderado', 'Intenso'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dolor_tipo_intensidad?: string[] | null;

  @ApiProperty({ 
    description: 'Frecuencia del dolor', 
    type: [String], 
    enum: ['Temporal', 'Intermitente', 'Continuo', 'Espontáneo'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dolor_frecuencia?: string[] | null;

  @ApiProperty({ 
    description: 'Dolor provocado', 
    type: [String], 
    enum: ['Al frío', 'Al calor', 'Localizado', 'Difuso'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dolor_provocado?: string[] | null;

  @ApiProperty({ description: '¿Irradiado?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  dolor_irradiado?: boolean | null;

  @ApiProperty({ description: '¿Hacia dónde?', type: String, required: false })
  @IsOptional()
  @IsString()
  dolor_irradiado_hacia_donde?: string | null;

  @ApiProperty({ description: '¿Puede calmarlo con algo?', type: String, required: false })
  @IsOptional()
  @IsString()
  dolor_puede_calmarlo_con_algo?: string | null;
}

export class TipoLesionesDto {
  @ApiProperty({ description: 'Manchas', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  manchas?: boolean | null;

  @ApiProperty({ description: 'Abultamiento de los tejidos', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  abultamiento_tejidos?: boolean | null;

  @ApiProperty({ description: 'Ulceraciones', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  ulceraciones?: boolean | null;

  @ApiProperty({ description: 'Ampollas', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  ampollas?: boolean | null;

  @ApiProperty({ description: 'Otros', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  otros?: boolean | null;
}

export class CuestionarioOdontologicoDto {
  // Consulta inicial
  @ApiProperty({ description: '¿Por qué asistió a la consulta?', type: String, required: false })
  @IsOptional()
  @IsString()
  por_que_asistio_a_la_consulta?: string | null;

  @ApiProperty({ description: '¿Consultó antes con algún otro profesional?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  consulto_antes_con_algun_otro_profesional?: boolean | null;

  @ApiProperty({ description: '¿Tomó algún medicamento?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tomo_algun_medicamento?: boolean | null;

  @ApiProperty({ description: 'Nombre de los medicamentos', type: String, required: false })
  @IsOptional()
  @IsString()
  nombre_de_los_medicamentos?: string | null;

  @ApiProperty({ description: '¿Desde cuándo?', type: String, required: false })
  @IsOptional()
  @IsString()
  desde_cuando_medicamentos?: string | null;

  @ApiProperty({ description: '¿Obtuvo resultados?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  obtuvo_resultados_medicamentos?: boolean | null;

  // Dolor (grupo)
  @ApiProperty({ description: 'Información sobre dolor', type: DolorDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DolorDto)
  dolor?: DolorDto | null;

  // Traumatismos
  @ApiProperty({ description: '¿Sufrió algún golpe en los dientes?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  sufrio_golpe_en_los_dientes?: boolean | null;

  @ApiProperty({ description: '¿Cuándo?', type: String, required: false })
  @IsOptional()
  @IsString()
  golpe_en_dientes_cuando?: string | null;

  @ApiProperty({ description: '¿Cómo se produjo?', type: String, required: false })
  @IsOptional()
  @IsString()
  golpe_en_dientes_como_se_produjo?: string | null;

  @ApiProperty({ description: '¿Se le fracturó algún diente?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  se_le_fracturo_algun_diente?: boolean | null;

  @ApiProperty({ description: '¿Cuál?', type: String, required: false })
  @IsOptional()
  @IsString()
  fractura_diente_cual?: string | null;

  @ApiProperty({ description: '¿Recibió algún tratamiento?', type: String, required: false })
  @IsOptional()
  @IsString()
  fractura_diente_recibio_tratamiento?: string | null;

  // Dificultades funcionales
  @ApiProperty({ description: '¿Tiene dificultad para hablar?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tiene_dificultad_para_hablar?: boolean | null;

  @ApiProperty({ description: '¿Tiene dificultad para masticar?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tiene_dificultad_para_masticar?: boolean | null;

  @ApiProperty({ description: '¿Tiene dificultad para abrir la boca?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tiene_dificultad_para_abrir_la_boca?: boolean | null;

  @ApiProperty({ description: '¿Tiene dificultad para tragar los alimentos?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tiene_dificultad_para_tragar_alimentos?: boolean | null;

  // Observaciones anormales
  @ApiProperty({ description: '¿Ha observado algo anormal en los labios?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_labios?: string | null;

  @ApiProperty({ description: '¿Ha observado algo anormal en la lengua?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_lengua?: string | null;

  @ApiProperty({ description: '¿Ha observado algo anormal en el paladar?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_paladar?: string | null;

  @ApiProperty({ description: '¿Ha observado algo anormal en el piso de boca?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_piso_boca?: string | null;

  @ApiProperty({ description: '¿Ha observado algo anormal en los carrillos?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_carrillos?: string | null;

  @ApiProperty({ description: '¿Ha observado algo anormal en otras zonas?', type: String, required: false })
  @IsOptional()
  @IsString()
  ha_observado_algo_anormal_otras_zonas?: string | null;

  // Tipos de lesiones (grupo)
  @ApiProperty({ description: '¿Qué tipo de lesiones presenta?', type: TipoLesionesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TipoLesionesDto)
  tipo_de_lesiones_presenta?: TipoLesionesDto | null;

  // Encías y sangrado
  @ApiProperty({ description: '¿Le sangran las encías?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  le_sangran_las_encias?: boolean | null;

  @ApiProperty({ description: '¿Cuándo?', type: String, required: false })
  @IsOptional()
  @IsString()
  le_sangran_las_encias_cuando?: string | null;

  // Supuración
  @ApiProperty({ description: '¿Sale pus de algún lugar de su boca?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  sale_pus_de_algun_lugar_de_su_boca?: boolean | null;

  @ApiProperty({ description: '¿De dónde?', type: String, required: false })
  @IsOptional()
  @IsString()
  sale_pus_de_donde?: string | null;

  // Movilidad y oclusión
  @ApiProperty({ description: '¿Tiene movilidad en sus dientes?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  tiene_movilidad_en_sus_dientes?: boolean | null;

  @ApiProperty({ description: '¿Al morder siente altos los dientes?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  al_morder_siente_altos_los_dientes?: boolean | null;

  // Inflamación facial
  @ApiProperty({ description: '¿Ha tenido la cara hinchada?', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  ha_tenido_la_cara_hinchada?: boolean | null;

  @ApiProperty({ description: '¿Qué hizo? (hielo, calor, otros)', type: String, required: false })
  @IsOptional()
  @IsString()
  tratamiento_cara_hinchada?: string | null;

  // Hábitos alimenticios e higiene
  @ApiProperty({ description: 'Momentos de azúcar diario', type: String, required: false })
  @IsOptional()
  @IsString()
  momentos_de_azucar_diario?: string | null;

  @ApiProperty({ description: 'Índice de placa', type: String, required: false })
  @IsOptional()
  @IsString()
  indice_de_placa?: string | null;

  @ApiProperty({ 
    description: 'Estado de la higiene bucal', 
    type: String, 
    enum: ['Muy bueno', 'Bueno', 'Deficiente', 'Malo'],
    required: false 
  })
  @IsOptional()
  @IsString()
  estado_de_la_higiene_bucal?: string | null;
}