import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsProductsService } from 'src/app/services/mercadolibre/analitics/AnalyticsProductsService';
import { GetAnalyticsProductsDto } from './dto/products/GetAnalyticsProductsDto';
import { SaveSelectionDto } from './dto/products/SaveSelectionDto';

@ApiTags('Analytics - Products')
@Controller('analytics/products')
export class AnalyticsProductsController {
  constructor(private readonly analyticsProductsService: AnalyticsProductsService) {}

  /* ================= OVERVIEW ================= */

  @ApiOperation({
    summary: 'Get products overview with filters (aggregated metrics only)'
  })
  @Get('overview')
  async getOverview(@Query() query: GetAnalyticsProductsDto) {
    return this.analyticsProductsService.getOverview(query);
  }

  /* ================= FAVORITOS SIMPLE ================= */

  @ApiOperation({
    summary: 'Save filtered selection into favorites folder'
  })
  @Post('save-selection')
  async saveSelection(@Body() body: SaveSelectionDto) {
    return this.analyticsProductsService.saveSelection(body.marketplaceId, body.filters);
  }

  /* ================= SEGMENTOS ================= */

  @ApiOperation({
    summary: 'Save filtered selection as a segment'
  })
  @Post('segments')
  async saveSelectionAsSegment(@Body() body: SaveSelectionDto) {
    return this.analyticsProductsService.saveSelectionAsSegment(body.marketplaceId, body.filters);
  }

  /* ================= METADATA ================= */

  @ApiOperation({ summary: 'Get all categories ordered for select' })
  @Get('categories')
  async getCategories() {
    return this.analyticsProductsService.getCategories();
  }

  @ApiOperation({ summary: 'Search categories by name' })
  @Get('categories/search')
  async searchCategories(@Query('q') q: string) {
    return this.analyticsProductsService.searchCategories(q);
  }

  @ApiOperation({ summary: 'Search brands for select' })
  @Get('brands')
  async getBrands(@Query('q') q?: string) {
    return this.analyticsProductsService.getBrands(q);
  }
}
