import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketplaceFavoritesService } from 'src/app/services/mercadolibre/analitics/AnalitycsFavoritesService';
import { UpdateMarketplaceStatusDto } from './dto/UpdateMarketplaceStatusDto';
import { GetFavoritesQueryDto } from './dto/favorites/getFavorites.dto';
import { BulkAddFavoritesDto } from './dto/BulkAddFavoritesDto';

@ApiTags('Marketplace Favorites')
@Controller('analytics/marketplace-favorites')
export class MarketplaceFavoritesController {
  constructor(private readonly service: MarketplaceFavoritesService) {}

  /* ================= MARKETPLACES ================= */

  @Post('marketplaces')
  @ApiOperation({ summary: 'Create a new marketplace folder' })
  @ApiResponse({ status: 201, description: 'Marketplace created' })
  async createMarketplace(@Body() body: { name: string }) {
    return this.service.createMarketplace(body.name);
  }

  @Get('marketplaces')
  @ApiOperation({ summary: 'Get all marketplace folders' })
  @ApiResponse({ status: 200, description: 'List of marketplaces' })
  async getMarketplaces() {
    return this.service.getMarketplaces();
  }

  @Patch('marketplaces/:id/status')
  @ApiOperation({ summary: 'Update marketplace status (active | closed)' })
  @ApiResponse({ status: 200, description: 'Marketplace status updated' })
  async updateMarketplaceStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMarketplaceStatusDto) {
    return this.service.updateMarketplaceStatus(id, dto.status);
  }

  /* ================= FAVORITES ================= */

  @Post(':id/favorites')
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({ status: 201, description: 'Product added to favorites' })
  async addFavorite(
    @Param('id', ParseIntPipe) marketplaceId: number,
    @Body()
    body: { productId: string; sellerSku: string }
  ) {
    return this.service.addFavorite(marketplaceId, body.productId, body.sellerSku);
  }
  /* ================= Obtener detalle de ITEMS FAVORITES ================= */

  @Get(':id/favorites')
  @ApiOperation({ summary: 'Get favorites products inside a marketplace folder' })
  @ApiResponse({
    status: 200,
    description: 'Paginated favorites list'
  })
  async getFavorites(@Param('id', ParseIntPipe) marketplaceId: number, @Query() query: GetFavoritesQueryDto) {
    return this.service.getFavorites(marketplaceId, query);
  }

  /* ================= ELIMINAR ITEMS FAVORITES ================= */

  @Delete(':id/favorites/:productId')
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiResponse({ status: 200, description: 'Product removed from favorites' })
  async removeFavorite(@Param('id', ParseIntPipe) marketplaceId: number, @Param('productId') productId: string) {
    return this.service.removeFavorite(marketplaceId, productId);
  }

  @Delete(':id/favorites')
  @ApiOperation({ summary: 'Remove multiple products from favorites' })
  @ApiResponse({
    status: 200,
    description: 'Products removed from favorites'
  })
  async removeFavoritesBulk(
    @Param('id', ParseIntPipe) marketplaceId: number,
    @Body('productIds') productIds: string[]
  ) {
    return this.service.removeFavoritesBulk(marketplaceId, productIds);
  }

  @Post(':id/cleanup-skus')
  @ApiOperation({
    summary: 'Clean duplicated SKUs (keep only one per SKU)',
    description: 'Receives a list of seller SKUs and removes duplicates, keeping only one record per SKU.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skus: {
          type: 'array',
          items: { type: 'string' },
          example: ['B0C33CHG99', 'B00004RDF0']
        }
      },
      required: ['skus']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Duplicates cleaned successfully',
    schema: {
      example: {
        success: true,
        cleaned: 10
      }
    }
  })
  async cleanDuplicatesBySkus(@Param('id', ParseIntPipe) marketplaceId: number, @Body('skus') skus: string[]) {
    return this.service.cleanDuplicatesBySkus(marketplaceId, skus);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Add products to multiple marketplace folders'
  })
  @ApiResponse({
    status: 201,
    description: 'Products added in bulk',
    schema: {
      example: {
        success: true,
        marketplacesAffected: 2,
        itemsPerMarketplace: 2
      }
    }
  })
  async addFavoritesBulk(@Body() body: BulkAddFavoritesDto) {
    return this.service.addFavoritesBulk(body.marketplaceIds, body.products);
  }

  /* ================= ANALYTICS ================= */

  @Get(':id/overview')
  @ApiOperation({
    summary: 'Get overview metrics for a marketplace folder'
  })
  @ApiResponse({
    status: 200,
    description: 'Marketplace overview metrics'
  })
  async getMarketplaceOverview(@Param('id', ParseIntPipe) marketplaceId: number) {
    return this.service.getMarketplaceOverview(marketplaceId);
  }

  @Get(':id/brands')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getBrands(
    @Param('id') marketplaceId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.service.getMarketplaceBrands(marketplaceId, {
      page,
      limit,
      search
    });
  }
  @Get(':id/categories')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getCategories(
    @Param('id') marketplaceId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.service.getMarketplaceCategories(marketplaceId, {
      page,
      limit,
      search
    });
  }

  // @Get(':id/full-overview')
  // @ApiOperation({
  //   summary: 'Get full overview including metrics, brand breakdown and category breakdown'
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Marketplace full analytics overview'
  // })
  // async getMarketplaceFullOverview(@Param('id', ParseIntPipe) marketplaceId: number) {
  //   return this.service.getMarketplaceFullOverview(marketplaceId);
  // }

  @Delete('marketplaces/:id')
  @ApiOperation({ summary: 'Delete a marketplace folder' })
  @ApiResponse({ status: 200, description: 'Marketplace deleted' })
  @ApiResponse({ status: 404, description: 'Marketplace not found' })
  async deleteMarketplace(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMarketplace(id);
  }
}
