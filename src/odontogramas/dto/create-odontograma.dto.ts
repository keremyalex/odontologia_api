import { IsNotEmpty, IsNumber, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Datos completos del estado dental',
    example: {
      diente_11: {
        estado: 'sano',
        tratamientos: [],
        observaciones: 'Sin alteraciones'
      },
      diente_16: {
        estado: 'cariado',
        superficie: 'oclusal',
        grado: 'moderado',
        tratamientos: ['obturacion'],
        material: 'resina',
        observaciones: 'Caries oclusal'
      }
    }
  })
  @IsNotEmpty()
  @IsObject()
  datos: any; // JSON con el estado de los dientes

  @ApiPropertyOptional({
    description: 'Observaciones adicionales sobre el odontograma',
    example: 'Odontograma post-tratamiento. Se observa mejoría general.'
  })
  @IsString()
  observaciones?: string;
}