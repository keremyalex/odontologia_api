import { Controller, Post, Body, Get, UseGuards, BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginResponseDto, UserResponseDto, ErrorResponseDto } from './dto/response.dto';
import { AuthResponse } from './interfaces/auth.interfaces';
import { JwtAuthGuard, RolesGuard } from './guards/auth.guards';
import { Roles } from './decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ 
        summary: 'Iniciar sesión',
        description: 'Autenticar usuario y obtener token JWT'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Login exitoso', 
        type: LoginResponseDto 
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Credenciales inválidas',
        type: ErrorResponseDto
    })
    @ApiBody({ type: LoginDto })
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ 
        summary: 'Registrar nuevo usuario',
        description: 'Crear un nuevo usuario en el sistema (solo administradores)'
    })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Usuario creado exitosamente', 
        type: LoginResponseDto 
    })
    @ApiResponse({ 
        status: HttpStatus.FORBIDDEN, 
        description: 'Acceso denegado - Solo administradores',
        type: ErrorResponseDto
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Datos inválidos o email ya existe',
        type: ErrorResponseDto
    })
    @ApiBearerAuth('access-token')
    @ApiBody({ type: CreateUserDto })
    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin') // Solo admin puede crear usuarios
    async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
        return this.authService.register(createUserDto);
    }

    @ApiOperation({ 
        summary: 'Configurar administrador inicial',
        description: 'Crear el primer usuario administrador del sistema. Solo funciona si no existen usuarios.'
    })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Administrador inicial creado exitosamente', 
        type: LoginResponseDto 
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Ya existen usuarios en el sistema',
        type: ErrorResponseDto
    })
    @ApiBody({ type: CreateUserDto })
    @Post('setup-admin')
    async setupAdmin(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
        // Solo permite crear admin si no existe ningún usuario
        const users = await this.authService.findAllUsers();
        if (users.length > 0) {
            throw new BadRequestException('Ya existen usuarios en el sistema. Use /auth/register');
        }
        
        // Forzar rol admin para el primer usuario
        createUserDto.rol = 'admin' as any;
        return this.authService.register(createUserDto);
    }

    @ApiOperation({ 
        summary: 'Listar usuarios',
        description: 'Obtener lista de todos los usuarios del sistema'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Lista de usuarios obtenida exitosamente', 
        type: [UserResponseDto]
    })
    @ApiResponse({ 
        status: HttpStatus.FORBIDDEN, 
        description: 'Acceso denegado - Permisos insuficientes',
        type: ErrorResponseDto
    })
    @ApiBearerAuth('access-token')
    @Get('users')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'recepcion') // Admin y recepción pueden ver usuarios
    async getUsers() {
        return this.authService.findAllUsers();
    }
}