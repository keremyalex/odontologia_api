import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoAdjunto {
  RADIOGRAFIA = 'radiografia',
  FOTO_INTRAORAL = 'foto_intraoral',
  FOTO_EXTRAORAL = 'foto_extraoral',
  DOCUMENTO = 'documento',
  ESTUDIO = 'estudio',
  OTRO = 'otro'
}

export class CreateAdjuntoDto {
  @ApiProperty({
    description: 'ID de la historia clínica a la que pertenece',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  historiaId: number;

  @ApiProperty({
    description: 'Nombre original del archivo subido',
    example: 'radiografia_panoramica_juan_perez.jpg'
  })
  @IsNotEmpty()
  @IsString()
  nombreOriginal: string;

  @ApiProperty({
    description: 'Tipo de adjunto médico',
    enum: TipoAdjunto,
    example: TipoAdjunto.RADIOGRAFIA,
    enumName: 'TipoAdjunto'
  })
  @IsNotEmpty()
  @IsEnum(TipoAdjunto)
  tipo: TipoAdjunto;

  @ApiPropertyOptional({
    description: 'Descripción detallada del archivo',
    example: 'Radiografía panorámica inicial para evaluación de cordales'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}