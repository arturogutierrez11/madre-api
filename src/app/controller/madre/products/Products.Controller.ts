import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from 'src/app/services/madre/products/ProductsService';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('madre')
  @ApiOperation({
    summary: 'Listar productos madre',
    description: 'Devuelve un listado paginado de productos madre. Permite filtrar opcionalmente por SKU.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 50,
    description: 'Cantidad máxima de productos a devolver'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Offset para paginación'
  })
  @ApiQuery({
    name: 'sku',
    required: false,
    type: String,
    example: 'ABC123',
    description: 'Filtra productos cuyo SKU contenga el valor indicado'
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de productos madre'
  })
  async listProducts(@Query('limit') limit = 500, @Query('offset') offset = 0, @Query('sku') sku?: string) {
    return this.productService.listAll(
      {
        limit: Number(limit),
        offset: Number(offset)
      },
      { sku }
    );
  }
}
