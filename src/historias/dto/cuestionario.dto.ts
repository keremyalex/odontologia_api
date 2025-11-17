import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, ValidateNested, IsEnum } from 'class-validator';

export enum TipoRespuesta {
    SI_NO = 'si_no',
    TEXTO = 'texto',
    MIXTO = 'mixto'
}

export class RespuestaSiNoDto {
    @ApiProperty({
        description: 'Respuesta de sí o no',
        example: true
    })
    @IsBoolean()
    respuesta: boolean;
}

export class RespuestaTextoDto {
    @ApiProperty({
        description: 'Respuesta en texto libre',
        example: 'Hipertensión arterial',
        required: false
    })
    @IsOptional()
    @IsString()
    respuesta?: string;
}

export class RespuestaMixtoDto {
    @ApiProperty({
        description: 'Respuesta de sí o no',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    respuesta?: boolean | null;

    @ApiProperty({
        description: 'Detalle adicional si la respuesta es afirmativa',
        example: 'Diabetes tipo 2, controlada con metformina',
        required: false
    })
    @IsOptional()
    @IsString()
    detalle?: string | null;
}

export class AntecedentesFamiliaresDirectDto {
    @ApiProperty({
        description: 'Padre con vida?',
        type: Boolean,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    padreConVida?: boolean | null;

    @ApiProperty({
        description: 'Enfermedad que padece o padeció (padre)',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    enfermedadPadre?: string | null;

    @ApiProperty({
        description: 'Madre con vida?',
        type: Boolean,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    madreConVida?: boolean | null;

    @ApiProperty({
        description: 'Enfermedad que padece o padeció (madre)',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    enfermedadMadre?: string | null;

    @ApiProperty({
        description: 'Hermanos? - Sanos?',
        type: RespuestaMixtoDto,
        required: false
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    hermanos?: RespuestaMixtoDto | null;

    @ApiProperty({
        description: 'Sufre de alguna enfermedad? - De qué?',
        type: RespuestaMixtoDto,
        required: false
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    sufreEnfermedad?: RespuestaMixtoDto | null;

    @ApiProperty({
        description: 'Hace algún tratamiento médico? - Cuál?',
        type: RespuestaMixtoDto,
        required: false
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    haceTratamientoMedico?: RespuestaMixtoDto | null;

    @ApiProperty({
        description: 'Qué medicamentos consume habitualmente?',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    medicamentosHabituales?: string | null;

    @ApiProperty({
        description: 'Qué medicamentos ha consumido en los últimos 5 años?',
        type: String,
        required: false
    })
    @IsOptional()
    @IsString()
    medicamentosUltimos5Anos?: string | null;
}

export class AntecedentesFamiliaresDto {
    @ApiProperty({
        description: 'Padre con vida?',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    padreConVida?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Enfermedad que padece o padeció (padre)',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    enfermedadPadre?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Madre con vida?',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    madreConVida?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Enfermedad que padece o padeció (madre)',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    enfermedadMadre?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Hermanos? - Sanos?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    hermanos?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Sufre de alguna enfermedad? - De qué?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    sufreEnfermedad?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Hace algún tratamiento médico? - Cuál?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    haceTratamientoMedico?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Qué medicamentos consume habitualmente?',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    medicamentosHabituales?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Qué medicamentos ha consumido en los últimos 5 años?',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    medicamentosUltimos5Anos?: RespuestaTextoDto;
}

export class HabitosYAntecedentesMedicosDirectDto {
    @ApiProperty({ description: 'Realiza algún deporte', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    realizaDeporte?: boolean | null;

    @ApiProperty({ description: 'Nota algún malestar al realizar deporte', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    malestarDeporte?: boolean | null;

    @ApiProperty({ description: 'Es alérgico a alguna droga', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    alergiaDroga?: boolean | null;

    @ApiProperty({ description: 'Es alérgico a la anestesia', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    alergiaAnestesia?: boolean | null;

    @ApiProperty({ description: 'Es alérgico a la penicilina', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    alergiaPenicilina?: boolean | null;

    @ApiProperty({ description: 'Es alérgico a otros medicamentos?', type: String, required: false })
    @IsOptional()
    @IsString()
    alergiaOtrosMedicamentos?: string | null;

    @ApiProperty({ description: 'Cuando le sacan una muela o se lastima, cicatriza bien', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    cicatrizaBien?: boolean | null;

    @ApiProperty({ description: 'Cuando se lastima, sangra mucho', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    sangraMucho?: boolean | null;

    @ApiProperty({ description: 'Tiene problema de colágeno (hiperaxitud)', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    problemaColageno?: boolean | null;

    @ApiProperty({ description: 'Antecedentes de fiebre reumática', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    fiebreReumatica?: boolean | null;

    @ApiProperty({ description: 'Se encuentra con alguna medicación?', type: String, required: false })
    @IsOptional()
    @IsString()
    seEncuentraConMedicacion?: string | null;

    @ApiProperty({ description: 'Es diabético', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    esDiabetico?: boolean | null;

    @ApiProperty({ description: 'Diabetes controlada - Con qué?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    diabetesControlada?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Problema cardíaco - Cuál?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    problemaCardiaco?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Toma aspirina/anticoagulante - Frecuencia?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    tomaAspirinaAnticoagulante?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Tiene presión alta', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    presionAlta?: boolean | null;

    @ApiProperty({ description: 'Chagas', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    chagas?: boolean | null;

    @ApiProperty({ description: 'Está en tratamiento por Chagas', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    tratamientoChagas?: boolean | null;

    @ApiProperty({ description: 'Problemas renales', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    problemasRenales?: boolean | null;

    @ApiProperty({ description: 'Úlcera gástrica', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    ulceraGastrica?: boolean | null;

    @ApiProperty({ description: 'Tuvo hepatitis', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    tuvoHepatitis?: boolean | null;

    @ApiProperty({ description: 'Tipo de hepatitis', type: String, required: false })
    @IsOptional()
    @IsString()
    tipoHepatitis?: string | null;

    @ApiProperty({ description: 'Problema hepático - Cuál?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    problemaHepatico?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Tuvo convulsiones', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    tuvoConvulsiones?: boolean | null;

    @ApiProperty({ description: 'Es epiléptico', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    esEpileptico?: boolean | null;

    @ApiProperty({ description: 'Medicación que toma', type: String, required: false })
    @IsOptional()
    @IsString()
    medicacionQueToma?: string | null;

    @ApiProperty({ description: 'Ha tenido Sífilis o Gonorrea', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    sifilis?: boolean | null;

    @ApiProperty({ description: 'Otra enfermedad infecto-contagiosa', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    otraEnfermedadInfectocontagiosa?: boolean | null;

    @ApiProperty({ description: 'Tuvo transfusiones', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    tuvoTransfusiones?: boolean | null;

    @ApiProperty({ description: 'Fue operado - De qué y cuándo?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    fueOperado?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Problema respiratorio - Cuál?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    problemaRespiratorio?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Fuma', type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    fuma?: boolean | null;

    @ApiProperty({ description: 'Está embarazada - De cuántos meses?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    estaEmbarazada?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Otra enfermedad o recomendación médica', type: String, required: false })
    @IsOptional()
    @IsString()
    otraEnfermedadRecomendacion?: string | null;

    @ApiProperty({ description: 'Tratamiento homeopático, acupuntura u otro - Cuál?', type: RespuestaMixtoDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    tratamientoHomeopatico?: RespuestaMixtoDto | null;

    @ApiProperty({ description: 'Médico clínico', type: String, required: false })
    @IsOptional()
    @IsString()
    medicoClinico?: string | null;

    @ApiProperty({ description: 'Clínica/Hospital para derivación', type: String, required: false })
    @IsOptional()
    @IsString()
    clinicaHospital?: string | null;
}

export class HabitosYAntecedentesMedicosDto {
    @ApiProperty({
        description: 'Realiza algún deporte',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    realizaDeporte?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Nota algún malestar al realizar deporte',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    malestarDeporte?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Es alérgico a alguna droga',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    alergiaDroga?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Es alérgico a la anestesia',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    alergiaAnestesia?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Es alérgico a la penicilina',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    alergiaPenicilina?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Es alérgico a otros medicamentos?',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    alergiaOtrosMedicamentos?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Cuando le sacan una muela o se lastima, cicatriza bien',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    cicatrizaBien?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Cuando se lastima, sangra mucho',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    sangraMucho?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Tiene problema de colágeno (hiperaxitud)',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    problemaColageno?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Antecedentes de fiebre reumática',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    fiebreReumatica?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Se encuentra con alguna medicación?',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    seEncuentraConMedicacion?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Es diabético',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    esDiabetico?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Diabetes controlada - Con qué?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    diabetesControlada?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Problema cardíaco - Cuál?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    problemaCardiaco?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Toma aspirina/anticoagulante - Frecuencia?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    tomaAspirinaAnticoagulante?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Tiene presión alta',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    presionAlta?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Chagas',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    chagas?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Está en tratamiento por Chagas',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    tratamientoChagas?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Problemas renales',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    problemasRenales?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Úlcera gástrica',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    ulceraGastrica?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Tuvo hepatitis',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    tuvoHepatitis?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Tipo de hepatitis',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    tipoHepatitis?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Problema hepático - Cuál?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    problemaHepatico?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Tuvo convulsiones',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    tuvoConvulsiones?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Es epiléptico',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    esEpileptico?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Medicación que toma',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    medicacionQueToma?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Ha tenido Sífilis o Gonorrea',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    sifilis?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Otra enfermedad infecto-contagiosa',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    otraEnfermedadInfectocontagiosa?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Tuvo transfusiones',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    tuvoTransfusiones?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Fue operado - De qué y cuándo?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    fueOperado?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Problema respiratorio - Cuál?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    problemaRespiratorio?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Fuma',
        type: RespuestaSiNoDto
    })
    @ValidateNested()
    @Type(() => RespuestaSiNoDto)
    @IsOptional()
    fuma?: RespuestaSiNoDto;

    @ApiProperty({
        description: 'Está embarazada - De cuántos meses?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    estaEmbarazada?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Otra enfermedad o recomendación médica',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    otraEnfermedadRecomendacion?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Tratamiento homeopático, acupuntura u otro - Cuál?',
        type: RespuestaMixtoDto
    })
    @ValidateNested()
    @Type(() => RespuestaMixtoDto)
    @IsOptional()
    tratamientoHomeopatico?: RespuestaMixtoDto;

    @ApiProperty({
        description: 'Médico clínico',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    medicoClinico?: RespuestaTextoDto;

    @ApiProperty({
        description: 'Clínica/Hospital para derivación',
        type: RespuestaTextoDto
    })
    @ValidateNested()
    @Type(() => RespuestaTextoDto)
    @IsOptional()
    clinicaHospital?: RespuestaTextoDto;
}

export class CuestionarioDirectDto {
    @ApiProperty({
        description: 'Antecedentes familiares con valores directos',
        type: AntecedentesFamiliaresDirectDto
    })
    @ValidateNested()
    @Type(() => AntecedentesFamiliaresDirectDto)
    @IsOptional()
    antecedentesFamiliares?: AntecedentesFamiliaresDirectDto | null;

    @ApiProperty({
        description: 'Hábitos y antecedentes médicos con valores directos',
        type: HabitosYAntecedentesMedicosDirectDto
    })
    @ValidateNested()
    @Type(() => HabitosYAntecedentesMedicosDirectDto)
    @IsOptional()
    habitosYAntecedentesMedicos?: HabitosYAntecedentesMedicosDirectDto | null;
}

export class CuestionarioCompletoDto {
    @ApiProperty({
        description: 'Antecedentes familiares',
        type: AntecedentesFamiliaresDto
    })
    @ValidateNested()
    @Type(() => AntecedentesFamiliaresDto)
    @IsOptional()
    antecedentesFamiliares?: AntecedentesFamiliaresDto;

    @ApiProperty({
        description: 'Hábitos y antecedentes médicos',
        type: HabitosYAntecedentesMedicosDto
    })
    @ValidateNested()
    @Type(() => HabitosYAntecedentesMedicosDto)
    @IsOptional()
    habitosYAntecedentesMedicos?: HabitosYAntecedentesMedicosDto;
}