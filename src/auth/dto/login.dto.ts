import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email del usuario registrado en el sistema',
        example: 'admin@clinica.com',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'admin123',
        minLength: 6
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}