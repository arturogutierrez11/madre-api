import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { ProductDeltaService } from 'src/app/services/madre/delta/ProductDeltaService';

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
}
