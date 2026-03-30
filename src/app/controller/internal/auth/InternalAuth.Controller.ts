import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { InternalAuthService } from 'src/app/services/auth/InternalAuthService';
import { CreateRefreshTokenDto } from './dto/CreateRefreshToken.dto';
import { CreateUserDto } from './dto/CreateUser.dto';
import { FindUserByEmailDto } from './dto/FindUserByEmail.dto';
import { FindValidRefreshTokenDto } from './dto/FindValidRefreshToken.dto';
import { RevokeRefreshTokenDto } from './dto/RevokeRefreshToken.dto';

@ApiTags('Internal Auth')
@ApiSecurity('internal-api-key')
@Controller('internal/auth')
@UseGuards(InternalApiKeyGuard)
export class InternalAuthController {
  constructor(private readonly internalAuthService: InternalAuthService) {}

  @Post('users')
  @ApiOperation({ summary: 'Crea un usuario para autenticación interna' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.internalAuthService.createUser({
      email: body.email,
      passwordHash: body.passwordHash,
      name: body.name,
      role: body.role,
      isActive: body.isActive ?? true
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };
  }

  @Post('find-user-by-email')
  @ApiOperation({ summary: 'Busca un usuario por email para autenticación interna' })
  @ApiBody({ type: FindUserByEmailDto })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async findUserByEmail(@Body() body: FindUserByEmailDto) {
    const user = await this.internalAuthService.findUserByEmail(body.email);

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Obtiene un usuario por ID para uso interno' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async getUserById(@Param('id') id: string) {
    const user = await this.internalAuthService.getUserById(id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };
  }

  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Crea un refresh token persistido' })
  @ApiBody({ type: CreateRefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Refresh token creado' })
  async createRefreshToken(@Body() body: CreateRefreshTokenDto) {
    const refreshToken = await this.internalAuthService.createRefreshToken({
      userId: body.userId,
      tokenHash: body.tokenHash.trim(),
      expiresAt: new Date(body.expiresAt),
      userAgent: body.userAgent?.trim(),
      ip: body.ip?.trim()
    });

    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt.toISOString(),
      revokedAt: refreshToken.revokedAt
    };
  }

  @Post('refresh-tokens/find-valid')
  @ApiOperation({ summary: 'Busca un refresh token válido por hash' })
  @ApiBody({ type: FindValidRefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Refresh token válido encontrado' })
  async findValidRefreshToken(@Body() body: FindValidRefreshTokenDto) {
    const refreshToken = await this.internalAuthService.findValidRefreshToken(body.tokenHash);

    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt.toISOString(),
      revokedAt: refreshToken.revokedAt
    };
  }

  @Post('refresh-tokens/revoke')
  @ApiOperation({ summary: 'Revoca un refresh token por hash' })
  @ApiBody({ type: RevokeRefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Refresh token revocado' })
  async revokeRefreshToken(@Body() body: RevokeRefreshTokenDto) {
    await this.internalAuthService.revokeRefreshToken(body.tokenHash);

    return {
      success: true
    };
  }

  @Post('users/:id/last-login')
  @ApiOperation({ summary: 'Actualiza el último login del usuario' })
  @ApiResponse({ status: 200, description: 'Último login actualizado' })
  async updateLastLogin(@Param('id') id: string) {
    await this.internalAuthService.updateLastLogin(id);

    return {
      success: true
    };
  }
}
