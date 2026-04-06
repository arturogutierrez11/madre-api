import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { MeliTokenSwaggerDTO } from './dto/MeliTokenSwaggerDTO';
import { MeliTokenService } from 'src/app/services/mercadolibre/token/MeliTokenService';
import { MeliTokenDTO } from 'src/core/entities/mercadolibre/tokens/dto/MeliTokenDTO';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';

@ApiTags('Mercado Libre - Internal')
@ApiSecurity('internal-api-key')
@Controller('internal/mercadolibre/token')
@UseGuards(InternalApiKeyGuard)
export class TokenController {
  constructor(private readonly meliTokenService: MeliTokenService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene el último token de MercadoLibre',
    description: `
Devuelve el último token almacenado para el **client_id actual**.

📌 **Notas**
- Endpoint interno
- El token está asociado al client_id configurado en la app
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Último token guardado',
    type: MeliTokenSwaggerDTO
  })
  @ApiQuery({
    name: 'appKey',
    required: false,
    example: 'default',
    description: 'Identificador lógico de la app de Mercado Libre'
  })
  async getLastToken(@Query('appKey') appKey?: string): Promise<MeliTokenDTO | null> {
    return this.meliTokenService.getLastToken(appKey);
  }

  @Get('expired')
  @ApiOperation({
    summary: 'Indica si el token actual está vencido',
    description: `
Evalúa si el token almacenado está expirado según **expires_at**.

📌 **Notas**
- Si no existe token, se considera expirado
- No aplica threshold de refresh (eso vive en el interactor)
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de expiración del token',
    schema: {
      example: { expired: false }
    }
  })
  @ApiQuery({
    name: 'appKey',
    required: false,
    example: 'default',
    description: 'Identificador lógico de la app de Mercado Libre'
  })
  async isTokenExpired(@Query('appKey') appKey?: string): Promise<{ expired: boolean }> {
    const token = await this.meliTokenService.getLastToken(appKey);

    if (!token) {
      return { expired: true };
    }

    return {
      expired: this.meliTokenService.isTokenExpired(token)
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Guarda o actualiza el token de MercadoLibre',
    description: `
Guarda o actualiza el token de MercadoLibre para el **client_id actual**.

📌 **Notas**
- Endpoint interno
- Usado por el callback OAuth o procesos internos
- El backend calcula automáticamente **expires_at**
    `
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: MeliTokenSwaggerDTO,
    description: 'Payload esperado para guardar el token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token guardado correctamente',
    schema: {
      example: { status: 'ok' }
    }
  })
  async upsertToken(@Body() token: MeliTokenDTO): Promise<{ status: 'ok' }> {
    await this.meliTokenService.upsertToken(token);
    return { status: 'ok' };
  }
}
