import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { GetAnalyticsBrandsDto } from './dto/GetAnalyticsBrandsDto';
import { GetAnalyticsBrands } from 'src/app/services/mercadolibre/analitics/AnalyticsBrandsService';
import { GetAnalyticsProductsDto } from './dto/GetAnalyticsProductsDto';

@ApiTags('Analytics - Brands')
@Controller('analytics/brands')
export class AnalyticsBrandsController {
  constructor(private readonly analyticsBrandsService: GetAnalyticsBrands) {}

  // 🔵 Listar marcas
  @ApiOperation({
    summary: 'List brands ordered by performance'
  })
  @Get()
  async getBrands(@Query() query: GetAnalyticsBrandsDto) {
    return this.analyticsBrandsService.getBrands(query);
  }

  // 🔵 Productos de una marca
  @ApiOperation({
    summary: 'List all products of a specific brand'
  })
  @ApiParam({
    name: 'brand',
    description: 'Brand name',
    example: 'Nike'
  })
  @Get(':brand/products')
  async getBrandProducts(@Param('brand') brand: string, @Query() query: GetAnalyticsProductsDto) {
    return this.analyticsBrandsService.getBrandProducts(brand, query);
  }
}
