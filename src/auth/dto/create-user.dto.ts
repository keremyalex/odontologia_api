import { IsString, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Dr. Juan Pérez',
    maxLength: 150
  })
  @IsString()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({
    description: 'Email único del usuario',
    example: 'juan.perez@clinica.com',
    format: 'email',
    maxLength: 200
  })
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
    maxLength: 30
  })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.DOCENTE,
    enumName: 'UserRole'
  })
  @IsEnum(UserRole, {
    message: 'El rol debe ser: admin, recepcion, estudiante o docente'
  })
  rol: UserRole;
}