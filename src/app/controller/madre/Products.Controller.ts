import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor() {}

  @Get()
  async findAll(): Promise<any> {
    return 'this.productsService.fhgfdsindAldddsl();';
  }
}
