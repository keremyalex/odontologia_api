import { 
  IsNotEmpty, 
  IsDateString, 
  IsInt, 
  IsOptional, 
  IsString, 
  MaxLength,
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import { TurnoEstado } from '../../entities/turno.entity';

export class CreateTurnoDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  pacienteId: number;

  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsEnum(TurnoEstado)
  estado?: TurnoEstado;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  estudianteId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  supervisorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  consultorio?: string;
}