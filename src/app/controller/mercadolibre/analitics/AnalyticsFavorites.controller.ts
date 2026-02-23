import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { MarketplaceFavoritesService } from 'src/app/services/mercadolibre/analitics/AnalitycsFavoritesService';
import { BulkAddFavoritesDto } from './dto/BulkAddFavoritesDto';

@ApiTags('Analytics - Marketplace Favorites')
@Controller('analytics/marketplace-favorites')
export class MarketplaceFavoritesController {
  constructor(private readonly service: MarketplaceFavoritesService) {}

  /* ================= MARKETPLACES ================= */

  @Post('marketplaces')
  @ApiOperation({
    summary: 'Crea un nuevo marketplace',
    description: `
Permite crear un nuevo marketplace donde se podrán guardar productos favoritos.

🔹 El nombre debe ser único.
🔹 Si el nombre ya existe, la base de datos rechazará la inserción.
`
  })
  @ApiBody({
    schema: {
      example: {
        name: 'Megatone'
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: {
        success: true
      }
    }
  })
  async createMarketplace(@Body() body: { name: string }) {
    return this.service.createMarketplace(body.name);
  }

  @Get('marketplaces')
  @ApiOperation({
    summary: 'Obtiene todos los marketplaces',
    description: `
Devuelve el listado completo de marketplaces disponibles.

Ideal para:
- Dropdown de selección
- Filtros
- Selector al guardar favoritos
`
  })
  @ApiOkResponse({
    schema: {
      example: [
        { id: 1, name: 'Megatone' },
        { id: 2, name: 'Fravega' }
      ]
    }
  })
  async getMarketplaces() {
    return this.service.getMarketplaces();
  }

  /* ================= FAVORITES ================= */

  @Post(':marketplaceId/products/:productId')
  @ApiOperation({
    summary: 'Agrega un producto como favorito en un marketplace',
    description: `
Guarda un producto dentro de un marketplace específico.

📌 Permite que un mismo producto esté guardado en múltiples marketplaces.
📌 Si el producto ya está guardado en ese marketplace, no se duplica.
`
  })
  @ApiParam({
    name: 'marketplaceId',
    required: true,
    description: 'ID del marketplace',
    example: 1
  })
  @ApiParam({
    name: 'productId',
    required: true,
    description: 'ID del producto',
    example: 'MLA1442595861'
  })
  @ApiBody({
    schema: {
      example: {
        sellerSku: 'B09BNVHQ2C'
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: {
        success: true
      }
    }
  })
  async addFavorite(
    @Param('marketplaceId') marketplaceId: number,
    @Param('productId') productId: string,
    @Body() body: { sellerSku: string }
  ) {
    return this.service.addFavorite(marketplaceId, productId, body.sellerSku);
  }

  @Delete(':marketplaceId/products/:productId')
  @ApiOperation({
    summary: 'Elimina un producto favorito de un marketplace',
    description: `
Remueve la relación entre el producto y el marketplace especificado.

📌 No afecta otros marketplaces donde el producto pueda estar guardado.
`
  })
  @ApiParam({
    name: 'marketplaceId',
    required: true,
    example: 1
  })
  @ApiParam({
    name: 'productId',
    required: true,
    example: 'MLA1442595861'
  })
  @ApiOkResponse({
    schema: {
      example: {
        success: true
      }
    }
  })
  async removeFavorite(@Param('marketplaceId') marketplaceId: number, @Param('productId') productId: string) {
    return this.service.removeFavorite(marketplaceId, productId);
  }

  @Get(':marketplaceId/products')
  @ApiOperation({
    summary: 'Obtiene los productos favoritos de un marketplace',
    description: `
Devuelve el listado de productos guardados como favoritos dentro de un marketplace específico.

Incluye:
- Información básica del producto
- Precio
- Vendidos
`
  })
  @ApiParam({
    name: 'marketplaceId',
    required: true,
    example: 1
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'MLA1442595861',
          title: 'Cámara Digital 4K',
          thumbnail: 'https://...',
          price: 441999,
          soldQuantity: 9,
          seller_sku: 'B09BNVHQ2C'
        }
      ]
    }
  })
  async getFavorites(@Param('marketplaceId') marketplaceId: number) {
    return this.service.getFavorites(marketplaceId);
  }
  @Post('bulk')
  @ApiOperation({
    summary: 'Agregar múltiples productos a favoritos en uno o más marketplaces'
  })
  @ApiResponse({
    status: 200,
    description: 'Favoritos agregados correctamente',
    schema: {
      example: {
        success: true,
        marketplacesAffected: 2,
        itemsPerMarketplace: 10
      }
    }
  })
  async bulkAdd(@Body() dto: BulkAddFavoritesDto) {
    return this.service.addFavoritesBulk(dto.marketplaceIds, dto.products);
  }
}
