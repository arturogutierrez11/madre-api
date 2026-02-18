import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { MercadoLibreProductsService } from 'src/app/services/mercadolibre/itemsDetails/MercadoLibreProductsService';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';

@ApiTags('Mercado Libre - Products')
@Controller('/mercadolibre/products')
export class MercadoLibreProductsController {
  constructor(private readonly productsService: MercadoLibreProductsService) {}

  // ─────────────────────────────────────────────
  // POST /mercadolibre/products
  // ─────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Guarda productos de MercadoLibre (bulk upsert)',
    description: `
Guarda o actualiza productos completos de MercadoLibre.

📌 Características:
- Inserción masiva (bulk)
- UPSERT automático
- Idempotente
- Soporta actualización completa del producto
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
            title: 'Fabricante Automático Leche Soja',
            price: 2689000,
            currency: 'ARS',
            stock: 5,
            soldQuantity: 1,
            status: 'active',
            condition: 'new',
            permalink: 'https://...',
            thumbnail: 'https://...',
            pictures: ['https://...', 'https://...'],
            sellerSku: 'B0C3TW3THM',
            brand: 'Moongiantgo',
            warranty: '1 mes',
            freeShipping: true,
            health: 0.8,
            lastUpdated: '2026-02-10T17:42:14.636Z',
            description: 'Descripción completa del producto...'
          }
        ]
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: {
        inserted: 1
      }
    }
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
  // GET /mercadolibre/products
  // ─────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Obtiene productos guardados (paginado)',
    description: `
Devuelve productos almacenados en base de datos.

📌 Soporta:
- Paginación
- Filtro por sellerId
- Filtro por status
    `
  })
  @ApiQuery({ name: 'sellerId', required: true, example: '1757836744' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiOkResponse({
    description: 'Listado paginado de productos',
    schema: {
      example: {
        items: [],
        total: 1000,
        limit: 50,
        offset: 0,
        count: 50,
        hasNext: true,
        nextOffset: 50
      }
    }
  })
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
}
