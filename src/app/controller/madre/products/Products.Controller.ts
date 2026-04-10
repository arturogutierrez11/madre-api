import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProductsService } from 'src/app/services/madre/products/ProductsService';
import { BulkProductSnapshotDto } from './dto/BulkProductSnapshotDto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post('madre/status/bulk')
  @ApiOperation({
    summary: 'Consultar en bulk price, stock y status por SKU',
    description: 'Devuelve un listado simple con sku, price, stock y status para los SKUs enviados.'
  })
  @ApiBody({ type: BulkProductSnapshotDto })
  @ApiResponse({
    status: 200,
    description: 'Snapshots de productos por SKU'
  })
  async getBulkStatusSnapshots(@Body() body: BulkProductSnapshotDto) {
    return this.productService.getStatusSnapshotsBySkus(body.skus);
  }

  @Get('madre')
  @ApiOperation({
    summary: 'Listar uno o muchos productos madre',
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
