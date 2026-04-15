import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { ProductDeltaService } from 'src/app/services/product-delta/ProductDeltaService';
import { UpdateCursorDto } from './dto/UpdateCursor.dto';

@ApiTags('Internal Product Delta')
@ApiSecurity('internal-api-key')
@Controller('internal/product-delta')
@UseGuards(InternalApiKeyGuard)
export class ProductDeltaController {
  constructor(private readonly productDeltaService: ProductDeltaService) {}

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
