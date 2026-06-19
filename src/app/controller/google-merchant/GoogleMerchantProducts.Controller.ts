import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { GoogleMerchantProductsService } from 'src/app/services/google-merchant/GoogleMerchantProductsService';

@ApiTags('Google Merchant - Internal')
@ApiSecurity('internal-api-key')
@Controller('internal/google-merchant/products')
@UseGuards(InternalApiKeyGuard)
export class GoogleMerchantProductsController {
  constructor(private readonly service: GoogleMerchantProductsService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Lista paginada de productos activos desde tlq.products',
    description: 'Ejecuta la consulta SELECT * FROM tlq.products WHERE is_active = 1 con paginado.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 50,
    description: 'Cantidad máxima de registros a devolver'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Offset de paginación'
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de productos activos',
    schema: {
      example: {
        items: [
          {
            id: 10,
            asin: 'B0CHPX17KM',
            name: 'Boost Mobile Apple iPhone 7 32GB Unlocked - Black',
            price: '98.99',
            is_active: 1,
            updated_at: '2026-06-10T18:26:45.000Z'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        count: 1,
        hasNext: false,
        nextOffset: null
      }
    }
  })
  async findActiveProducts(@Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.service.findActiveProducts(Number(limit), Number(offset));
  }
}
