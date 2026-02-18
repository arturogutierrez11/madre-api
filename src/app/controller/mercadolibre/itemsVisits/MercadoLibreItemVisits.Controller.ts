import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MercadoLibreItemVisitsService } from 'src/app/services/mercadolibre/itemsVisits/MercadoLibreItemVisitsService';
import { PaginatedResult } from 'src/core/entities/mercadolibre/itemsVisits/PaginatedResult';
import { MercadoLibreItemVisit } from 'src/core/entities/mercadolibre/itemsVisits/MercadoLibreItemVisit';

@ApiTags('Mercado Libre - Item Visits')
@Controller('/mercadolibre/item-visits')
export class MercadoLibreItemVisitsController {
  constructor(private readonly service: MercadoLibreItemVisitsService) {}

  // ─────────────────────────────────────────────
  // POST → UPSERT
  // ─────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Guarda o actualiza visitas de un item'
  })
  @ApiBody({
    schema: {
      example: {
        itemId: 'MLA1424563181',
        totalVisits: 177
      }
    }
  })
  @ApiOkResponse({
    schema: {
      example: { saved: true }
    }
  })
  async saveVisit(
    @Body()
    body: {
      itemId: string;
      totalVisits: number;
    }
  ): Promise<{ saved: boolean }> {
    return this.service.saveVisit(body);
  }

  // ─────────────────────────────────────────────
  // GET ONE
  // ─────────────────────────────────────────────
  @Get(':itemId')
  @ApiOperation({
    summary: 'Obtiene visitas de un item específico'
  })
  @ApiParam({
    name: 'itemId',
    example: 'MLA1424563181'
  })
  async getByItemId(@Param('itemId') itemId: string): Promise<MercadoLibreItemVisit | null> {
    return this.service.getByItemId(itemId);
  }

  // ─────────────────────────────────────────────
  // GET PAGINATED
  // ─────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Obtiene visitas de items con paginado'
  })
  @ApiQuery({ name: 'limit', example: 50 })
  @ApiQuery({ name: 'offset', example: 0 })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            itemId: 'MLA1424563181',
            totalVisits: 177,
            createdAt: '2026-02-12T16:00:00.000Z',
            updatedAt: '2026-02-12T16:00:00.000Z'
          }
        ],
        total: 100,
        limit: 50,
        offset: 0,
        count: 1,
        hasNext: true,
        nextOffset: 50
      }
    }
  })
  async getPaginated(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0'
  ): Promise<PaginatedResult<MercadoLibreItemVisit>> {
    return this.service.getPaginated({
      limit: Number(limit),
      offset: Number(offset)
    });
  }
}
