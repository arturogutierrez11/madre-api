import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetAnalyticsProductsDto } from './dto/GetAnalyticsProductsDto';
import { GetAnalyticsProducts } from 'src/app/services/mercadolibre/analitics/AnalyticsProductsService';

@ApiTags('Analytics - Products')
@Controller('analytics/products')
export class AnalyticsProductsController {
  constructor(private readonly analyticsProducts: GetAnalyticsProducts) {}

  @ApiOperation({
    summary: 'List products with pagination and filters'
  })
  @Get()
  async getProducts(@Query() query: GetAnalyticsProductsDto) {
    return this.analyticsProducts.execute(query);
  }
}
