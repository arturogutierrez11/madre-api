import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Get(':id/full-overview')
  @ApiOperation({
    summary: 'Get full overview including metrics, brand breakdown and category breakdown'
  })
  @ApiResponse({
    status: 200,
    description: 'Marketplace full analytics overview'
  })
  async getMarketplaceFullOverview(@Param('id', ParseIntPipe) marketplaceId: number) {
    return this.service.getMarketplaceFullOverview(marketplaceId);
  }

  @Delete('marketplaces/:id')
  @ApiOperation({ summary: 'Delete a marketplace folder' })
  @ApiResponse({ status: 200, description: 'Marketplace deleted' })
  @ApiResponse({ status: 404, description: 'Marketplace not found' })
  async deleteMarketplace(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMarketplace(id);
  }
}
