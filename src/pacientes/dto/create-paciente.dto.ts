import { IsString, IsEmail, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @MaxLength(150)
  apellido: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ci?: string;

  @IsOptional()
  @IsDateString()
  fechaNac?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  sexo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nacionalidad?: string;
}