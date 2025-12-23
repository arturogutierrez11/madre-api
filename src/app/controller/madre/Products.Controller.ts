import { Controller, Get } from '@nestjs/common';

@Controller('/api/products')
export class ProductsController {
  constructor() {}

  @Get()
  async findAll(): Promise<any> {
    return 'this.productsService.findAll();';
  }
}
