import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEspecialidadDto {
  @ApiProperty({
    description: 'Nombre de la especialidad',
    example: 'Endodoncia',
    maxLength: 100
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la especialidad',
    example: 'Especialidad enfocada en el tratamiento de conductos radiculares'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
