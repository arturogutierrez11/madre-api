import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { GetAnalyticsBrandsDto } from './dto/GetAnalyticsBrandsDto';
import { GetAnalyticsBrands } from 'src/app/services/mercadolibre/analitics/AnalyticsBrandsService';

@ApiTags('Analytics - Brands')
@Controller('analytics/brands')
export class AnalyticsBrandsController {
  constructor(private readonly analyticsBrandsService: GetAnalyticsBrands) {}

  // 🔵 Listar marcas con métricas
  @ApiOperation({
    summary: 'List brands ordered by performance'
  })
  @Get()
  async getBrands(@Query() query: GetAnalyticsBrandsDto) {
    return this.analyticsBrandsService.getBrands(query);
  }

  // 🔵 Listar todas las marcas (solo nombre, paginado)
  @ApiOperation({
    summary: 'Get all brands (paginated)'
  })
  @Get('/all')
  async getAllBrands(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.analyticsBrandsService.getAllBrands({
      page: Number(page) || 1,
      limit: Number(limit) || 50
    });
  }
}
