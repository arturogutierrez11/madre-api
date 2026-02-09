import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { MercadoLibreItemsService } from 'src/app/services/mercadolibre/itemsId/MercadoLibreItemsService';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

@ApiTags('Mercado Libre - Items')
@Controller('/mercadolibre/items')
export class MercadoLibreItemsController {
  constructor(private readonly itemsService: MercadoLibreItemsService) {}

  // -------------------------
  // POST /internal/mercadolibre/items
  // -------------------------
  @Post()
  @ApiOperation({
    summary: 'Guarda items_id de MercadoLibre (bulk)',
    description: `
Guarda o actualiza items_id de MercadoLibre asociados a un seller.

📌 **Notas**
- Inserción en bloque
- Idempotente
- Actualiza status si el item ya existe
    `
  })
  @ApiBody({
    schema: {
      example: {
        sellerId: '1757836744',
        status: 'active',
        items: ['MLA123', 'MLA456']
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: { inserted: 2 }
    }
  })
  async saveItemsBulk(
    @Body()
    body: {
      sellerId: string;
      status: string;
      items: string[];
    }
  ): Promise<{ inserted: number }> {
    return this.itemsService.saveItemsBulk(body);
  }

  // -------------------------
  // GET /internal/mercadolibre/items
  // -------------------------
  @Get()
  @ApiOperation({
    summary: 'Obtiene items_id de MercadoLibre con paginado',
    description: `
Devuelve items_id almacenados en la base de datos con soporte de paginado y filtros.
    `
  })
  @ApiQuery({ name: 'limit', example: 50 })
  @ApiQuery({ name: 'offset', example: 0 })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({
    schema: {
      example: {
        items: ['MLA123', 'MLA456'],
        total: 351097,
        limit: 50,
        offset: 0,
        count: 2,
        hasNext: true,
        nextOffset: 50
      }
    }
  })
  async getItems(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: string
  ): Promise<PaginatedResult<string>> {
    return this.itemsService.getItemsPaginated(
      {
        limit: Number(limit),
        offset: Number(offset)
      },
      { sellerId, status }
    );
  }
}
