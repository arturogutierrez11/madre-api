import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from 'src/app/services/madre/products/ProductsService';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('madre')
  async listProducts(@Query('limit') limit = 500, @Query('offset') offset = 0) {
    return this.productService.listAll({
      limit: Number(limit),
      offset: Number(offset)
    });
  }
}
