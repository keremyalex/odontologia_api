import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    example: {
      id: 1,
      nombre: 'Dr. Admin',
      email: 'admin@clinica.com',
      rol: 'admin'
    }
  })
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

export class UserResponseDto {
  @ApiProperty({ description: 'ID único del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Dr. Juan Pérez' })
  nombre: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@clinica.com' })
  email: string;

  @ApiProperty({ description: 'Rol del usuario', example: 'docente' })
  rol: string;

  @ApiProperty({ description: 'Fecha de creación', example: '2024-11-16T10:30:00Z' })
  creadoAt: Date;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Mensaje de error', example: 'Credenciales inválidas' })
  message: string;

  @ApiProperty({ description: 'Código de estado HTTP', example: 401 })
  statusCode: number;

  @ApiProperty({ description: 'Descripción del error', example: 'Unauthorized' })
  error: string;
}