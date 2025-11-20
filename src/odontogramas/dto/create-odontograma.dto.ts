import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, IsIn, IsBoolean, Matches, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToothSurfaceDto {
    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    vestibular: string;

    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    oclusal: string;

    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    distal: string;

    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    lingual: string;

    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    mesial: string;
}

export class ToothDto {
    @ApiProperty({ example: 11, description: 'ID único del diente' })
    @IsNumber()
    id: number;

    @ApiProperty({ example: '1.1', description: 'Notación FDI del diente' })
    @IsString()
    @Matches(/^[1-4]\.[1-8]$/, { message: 'Formato FDI inválido' })
    number: string;

    @ApiProperty({ example: 'Superior Derecho', description: 'Posición del diente' })
    @IsString()
    position: string;

    @ApiProperty({ example: 2, description: 'Grupo dental (1-6)' })
    @IsNumber()
    @Min(1)
    @Max(6)
    group: number;

    @ApiProperty({
        enum: ['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'],
        example: 'sano',
        description: 'Estado general del diente'
    })
    @IsString()
    @IsIn(['sano', 'caries', 'obturado', 'corona', 'endodoncia', 'implante', 'extraido', 'fractura', 'puente', 'extraccion_indicada'])
    status: string;

    @ApiProperty({ type: ToothSurfaceDto, description: 'Estados de las superficies dentales' })
    @ValidateNested()
    @Type(() => ToothSurfaceDto)
    surfaces: ToothSurfaceDto;

    @ApiProperty({ example: false, description: 'Indica si es diente temporal' })
    @IsBoolean()
    isTemporary: boolean;

    @ApiProperty({ example: 'Observaciones específicas del diente', required: false })
    @IsOptional()
    @IsString()
    observations?: string;
}

export class CreateOdontogramaDto {
  @ApiProperty({
    description: 'ID de la historia clínica a la que pertenece',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  historiaId: number;

  @ApiProperty({
    description: 'Fecha del odontograma',
    example: '2024-11-16',
    format: 'date'
  })
  @IsNotEmpty()
  @IsString()
  fecha: string; // formato: YYYY-MM-DD

  @ApiProperty({ 
        type: [ToothDto], 
        description: 'Array de 32 dientes con su información completa',
        minItems: 32,
        maxItems: 32
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToothDto)
    dientes: ToothDto[];

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre el odontograma',
    example: 'Odontograma inicial del paciente'
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateOdontogramaObservacionesDto {
    @ApiProperty({ 
        example: 'Observaciones actualizadas del odontograma',
        description: 'Nuevas observaciones generales'
    })
    @IsString()
    observaciones: string;
}