import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { GetAnalyticsBrandsDto } from './dto/GetAnalyticsBrandsDto';
import { GetAnalyticsBrands } from 'src/app/services/mercadolibre/analitics/AnalyticsBrandsService';

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
}
