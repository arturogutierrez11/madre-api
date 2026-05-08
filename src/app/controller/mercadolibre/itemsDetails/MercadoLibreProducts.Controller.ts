import { Body, Controller, Get, Post, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

import { MercadoLibreProductsService } from 'src/app/services/mercadolibre/itemsDetails/MercadoLibreProductsService';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';
import { GetCategoriesBySkusDto } from './dto/GetCategoriesBySkus.dto';

@ApiTags('Mercado Libre - Products')
@Controller('/mercadolibre/products')
export class MercadoLibreProductsController {
  constructor(private readonly productsService: MercadoLibreProductsService) {}

  // ─────────────────────────────────────────────
  // POST → UPSERT (insert + update)
  // ─────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Guarda productos de MercadoLibre (bulk upsert)'
  })
  async saveProductsBulk(
    @Body()
    body: {
      sellerId: string;
      products: MercadoLibreProduct[];
    }
  ): Promise<{ inserted: number }> {
    return this.productsService.saveBulk(body);
  }

  // ─────────────────────────────────────────────
  // PATCH → UPDATE ONLY
  // ─────────────────────────────────────────────
  @Patch()
  @ApiOperation({
    summary: 'Actualiza productos existentes (bulk update)',
    description: `
Actualiza productos existentes sin insertar nuevos.

📌 Características:
- Solo UPDATE
- No inserta productos nuevos
- Ideal para actualizar métricas dinámicas:
  price, stock, sold_quantity, status, health, last_updated, category_id
    `
  })
  @ApiBody({
    schema: {
      example: {
        sellerId: '1757836744',
        products: [
          {
            id: 'MLA1424563181',
            categoryId: 'MLA1246',
            price: 1805000,
            stock: 1,
            soldQuantity: 0,
            status: 'active',
            freeShipping: true,
            health: 0.95,
            lastUpdated: '2026-02-14T07:09:35.000Z'
          }
        ]
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: {
        updated: 1
      }
    }
  })
  async updateProductsBulk(
    @Body()
    body: {
      sellerId: string;
      products: MercadoLibreProduct[];
    }
  ): Promise<{ updated: number }> {
    return this.productsService.updateBulk(body);
  }

  // ─────────────────────────────────────────────
  // GET paginado
  // ─────────────────────────────────────────────
  @Get()
  @ApiQuery({ name: 'sellerId', required: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getProducts(
    @Query('sellerId') sellerId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('status') status?: string
  ): Promise<PaginatedResult<MercadoLibreProduct>> {
    return this.productsService.getProducts({
      sellerId,
      limit: Number(limit),
      offset: Number(offset),
      status
    });
  }

  @Post('/search')
  @ApiOperation({
    summary: 'Busca múltiples productos por IDs',
    description: `
Permite consultar múltiples productos por ID.

Ideal para:
- Validar existencia
- Determinar insert vs update
- Sincronizaciones incrementales
  `
  })
  @ApiBody({
    schema: {
      example: {
        sellerId: '1757836744',
        ids: ['MLA123', 'MLA456']
      }
    }
  })
  @ApiOkResponse({
    description: 'Lista de productos encontrados'
  })
  async searchMany(
    @Body()
    body: {
      sellerId: string;
      ids: string[];
    }
  ): Promise<MercadoLibreProduct[]> {
    return this.productsService.findManyByIds(body);
  }

  @Post('/categories/by-skus')
  @ApiOperation({
    summary: 'Busca category_id por seller_sku',
    description: `
Devuelve todos los MLAs/category_id encontrados para cada SKU enviado.

📌 Nota:
- Un mismo seller_sku puede tener más de una publicación en Mercado Libre
- Por eso la respuesta devuelve todos los matches encontrados
    `
  })
  @ApiBody({ type: GetCategoriesBySkusDto })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiOkResponse({
    description: 'Lista de categorías encontradas por SKU',
    schema: {
      example: {
        items: [
          {
            sku: 'B0C33CHG99',
            matches: [
              { mlaId: 'MLA1424202023', categoryId: 'MLA456045' },
              { mlaId: 'MLA1424209999', categoryId: 'MLA123456' }
            ]
          },
          {
            sku: 'B001RCD2DW',
            matches: []
          }
        ],
        total: 2,
        limit: 50,
        offset: 0,
        count: 2,
        hasNext: false,
        nextOffset: null
      }
    }
  })
  async getCategoriesBySkus(
    @Body() body: GetCategoriesBySkusDto,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0'
  ) {
    return this.productsService.findCategoryIdsBySellerSkus({
      skus: body.skus,
      limit: Number(limit),
      offset: Number(offset)
    });
  }
}
