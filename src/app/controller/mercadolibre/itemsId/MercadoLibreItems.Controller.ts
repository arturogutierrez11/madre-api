import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

import { MercadoLibreItemsService } from 'src/app/services/mercadolibre/itemsId/MercadoLibreItemsService';
import { CursorPaginatedResult } from 'src/core/entities/mercadolibre/itemsId/PaginatedResult';

@ApiTags('Mercado Libre - Items')
@Controller('/mercadolibre/items')
export class MercadoLibreItemsController {
  constructor(private readonly itemsService: MercadoLibreItemsService) {}

  // -------------------------
  // POST /mercadolibre/items
  // -------------------------
  @Post()
  @ApiOperation({
    summary: 'Guarda items_id de MercadoLibre (bulk)',
    description: `
Guarda o actualiza items_id de MercadoLibre asociados a un seller.

📌 Notas:
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
  // GET /mercadolibre/items
  // -------------------------
  @Get()
  @ApiOperation({
    summary: 'Obtiene items_id con paginado por cursor (lastId)',
    description: `
Devuelve items_id almacenados usando cursor pagination.

📌 Cómo funciona:
- En la primera llamada no enviar lastId
- En la siguiente llamada enviar el lastId recibido
- Es más eficiente que offset para grandes volúmenes
    `
  })
  @ApiQuery({ name: 'limit', example: 50 })
  @ApiQuery({
    name: 'lastId',
    required: false,
    example: 1000,
    description: 'Último id recibido en la página anterior'
  })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({
    schema: {
      example: {
        items: ['MLA123', 'MLA456'],
        limit: 50,
        count: 2,
        lastId: 1050,
        hasNext: true
      }
    }
  })
  async getItems(
    @Query('limit') limit = '50',
    @Query('lastId') lastId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('status') status?: string
  ): Promise<CursorPaginatedResult<string>> {
    return this.itemsService.getItemsPaginated(
      {
        limit: Number(limit),
        lastId: lastId ? Number(lastId) : undefined
      },
      { sellerId, status }
    );
  }
}
