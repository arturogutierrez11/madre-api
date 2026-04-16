import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { ProductDeltaService } from 'src/app/services/product-delta/ProductDeltaService';
import { UpdateCursorDto } from './dto/UpdateCursor.dto';

@ApiTags('Internal Product Delta')
@ApiSecurity('internal-api-key')
@Controller('internal/product-delta')
@UseGuards(InternalApiKeyGuard)
export class ProductDeltaController {
  constructor(private readonly productDeltaService: ProductDeltaService) {}

  @Get('changes')
  @ApiOperation({
    summary: 'Obtiene cambios incrementales desde productos_madre_delta',
    description: 'Permite consumo incremental usando cursor (after_id). Devuelve registros ordenados por id ASC.'
  })
  @ApiQuery({
    name: 'after_id',
    required: false,
    type: Number,
    example: 0,
    description: 'ID a partir del cual leer cambios (exclusivo)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 1000,
    description: 'Cantidad máxima de registros (max 5000)'
  })
  @ApiResponse({ status: 200, description: 'Cambios obtenidos correctamente' })
  async getChanges(@Query('after_id') afterId = '0', @Query('limit') limit = '1000') {
    const parsedAfterId = Math.max(0, Number(afterId) || 0);
    const parsedLimit = Math.min(5000, Math.max(1, Number(limit) || 1000));

    return this.productDeltaService.getChanges(parsedAfterId, parsedLimit);
  }

  @Get('cursor')
  @ApiOperation({ summary: 'Obtiene el último delta_id procesado por un consumidor' })
  @ApiQuery({ name: 'sync_key', required: true, example: 'products_api_delta' })
  @ApiResponse({ status: 200, description: 'Cursor obtenido' })
  async getCursor(@Query('sync_key') syncKey: string) {
    if (!syncKey) throw new BadRequestException('sync_key is required');

    return this.productDeltaService.getCursor(syncKey);
  }

  @Post('cursor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Actualiza el último delta_id procesado por un consumidor' })
  @ApiBody({ type: UpdateCursorDto })
  @ApiResponse({ status: 200, description: 'Cursor actualizado' })
  async updateCursor(@Body() body: UpdateCursorDto) {
    return this.productDeltaService.updateCursor(body.sync_key, body.last_delta_id);
  }
}
