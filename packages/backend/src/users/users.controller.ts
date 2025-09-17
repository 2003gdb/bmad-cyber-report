
import { Body, Controller, Post, Get, UseGuards, Req, HttpException, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOperation, ApiProperty, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest, UserProfile } from "src/common/interfaces/authenticated-request";
import { TokenService } from "src/auth/token.service";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: "juan@example.com", required: true })
    @IsEmail({}, { message: "Ingrese un correo electrónico válido" })
    email!: string;

    @ApiProperty({ example: "Juan Pérez", required: false })
    @IsOptional()
    @IsString({ message: "El nombre debe ser una cadena de texto válida" })
    name!: string;

    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    password!: string;
}

@ApiTags('Módulo de Usuarios')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokenService: TokenService
    ) {}

    @ApiOperation({ summary: "Endpoint de registro de usuarios" })
    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            // Check if user already exists
            const existingUser = await this.usersService.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new HttpException("El correo electrónico ya está registrado", HttpStatus.CONFLICT);
            }

            const user = await this.usersService.createUser(
                createUserDto.email,
                createUserDto.name || '',
                createUserDto.password,
            );

            if (user) {
                // Create user profile for JWT token
                const userProfile: UserProfile = {
                    id: user.id,
                    email: user.email,
                    name: user.name
                };

                // Generate JWT tokens
                const accessToken = await this.tokenService.generateAccessToken(userProfile);
                const refreshToken = await this.tokenService.generateRefreshToken(userProfile);

                // Don't return sensitive data
                const { password_hash: _password_hash, salt: _salt, ...safeUser } = user;

                return {
                    success: true,
                    message: "Usuario registrado exitosamente",
                    user: safeUser,
                    access_token: accessToken,
                    refresh_token: refreshToken
                };
            }

            throw new HttpException("Error al registrar usuario", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Obtener perfil del usuario autenticado" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: AuthenticatedRequest) {
        return {
            success: true,
            profile: req.user.profile
        };
    }
}