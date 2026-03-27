import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  BadRequestException,
  Query,
  NotFoundException
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

import { IProductSyncRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRepository';
import { BulkMarketplaceProductsDto } from 'src/core/entities/product-sync/dto/BulkMarketplaceProductsDto';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';
import { UpdateProductSyncItemDto } from 'src/core/entities/product-sync/dto/UpdateProductSyncItemDto';
import { ProductSyncUpdateService } from 'src/app/services/madre/product-sync/ProductSyncUpdateService';

@ApiTags('Procesos internos · Sincronización de Productos - Sync_items')
@Controller('internal/marketplace/products')
export class MarketplaceProductsBulkController {
  constructor(
    @Inject('IProductSyncRepository')
    private readonly productSyncRepository: IProductSyncRepository,
    private readonly productSyncUpdateService: ProductSyncUpdateService
  ) {}

  private buildStatusSummary(
    marketplace: string,
    total: number,
    rows: Array<{ status: string; total: number }>
  ) {
    const normalizedRows = rows.map(row => ({
      status: row.status,
      total: Number(row.total ?? 0),
      percentage: total > 0 ? Number(((Number(row.total ?? 0) / total) * 100).toFixed(2)) : 0
    }));

    return {
      marketplace,
      total,
      statuses: normalizedRows,
      statusMap: Object.fromEntries(normalizedRows.map(row => [row.status, row.total])),
      statusPercentageMap: Object.fromEntries(normalizedRows.map(row => [row.status, row.percentage]))
    };
  }

  private buildMarketplaceSnapshot(rows: any[]) {
    const sellerSku = rows[0]?.seller_sku ?? null;
    const items = rows.map(row => ({
      marketplace: row.marketplace,
      marketplaceSku: row.marketplace_sku,
      externalId: row.external_id,
      price: Number(row.price),
      stock: Number(row.stock),
      status: row.status,
      isActive: Boolean(row.is_active),
      lastSeenAt: row.last_seen_at,
      updatedAt: row.updated_at
    }));

    return {
      sellerSku,
      marketplaces: items.map(item => item.marketplace),
      priceByMarketplace: Object.fromEntries(items.map(item => [item.marketplace, item.price])),
      stockByMarketplace: Object.fromEntries(items.map(item => [item.marketplace, item.stock])),
      statusByMarketplace: Object.fromEntries(items.map(item => [item.marketplace, item.status])),
      items
    };
  }

  /* =====================================================
     BULK UPSERT (CRON / FULL SYNC)
  ===================================================== */
  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Bulk upsert de productos desde marketplaces',
    description:
      'Inserta o actualiza productos sincronizados desde un marketplace. ' +
      'Si hay cambios, registra historial automáticamente.'
  })
  @ApiBody({
    schema: {
      example: {
        marketplace: 'megatone',
        items: [
          {
            externalId: '155562',
            sellerSku: 'B09S3XJC81',
            marketplaceSku: 'MKT0001LQA',
            price: 596398.95,
            stock: 5,
            status: 'PENDING',
            raw: {
              publicationId: 155562,
              status: 'Pendiente_Activacion'
            }
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 204, description: 'Productos procesados correctamente' })
  async bulkUpsert(@Body() body: BulkMarketplaceProductsDto): Promise<void> {
    if (!body.marketplace) {
      throw new BadRequestException('marketplace es obligatorio');
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('items must not be empty');
    }

    const items: ProductSyncItem[] = body.items.map(item => ({
      marketplace: body.marketplace,
      externalId: item.externalId,
      sellerSku: item.sellerSku,
      marketplaceSku: item.marketplaceSku ?? null,
      price: item.price,
      stock: item.stock,
      status: item.status,
      raw: item.raw
    }));

    await this.productSyncRepository.bulkUpsert(items);
  }

  @Get('items/:sellerSku/marketplaces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ver un SKU en todos los marketplaces',
    description:
      'Devuelve todos los marketplaces donde existe el sellerSku junto con precio, stock y estado actual.'
  })
  @ApiParam({
    name: 'sellerSku',
    description: 'SKU del vendedor',
    example: 'B0CW2XFT87'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot del SKU por marketplace',
    schema: {
      example: {
        sellerSku: 'B0CW2XFT87',
        marketplaces: ['fravega', 'megatone', 'oncity'],
        priceByMarketplace: {
          fravega: 12000,
          megatone: 13000,
          oncity: 15000
        },
        stockByMarketplace: {
          fravega: 2,
          megatone: 1,
          oncity: 0
        },
        statusByMarketplace: {
          fravega: 'ACTIVE',
          megatone: 'PAUSED',
          oncity: 'PAUSED'
        },
        items: [
          {
            marketplace: 'oncity',
            marketplaceSku: '11',
            externalId: '11',
            price: 0,
            stock: 0,
            status: 'PAUSED',
            isActive: true,
            lastSeenAt: '2026-02-05T12:46:17.000Z',
            updatedAt: '2026-02-05T12:46:17.000Z'
          }
        ]
      }
    }
  })
  async getMarketplaceSnapshotBySellerSku(@Param('sellerSku') sellerSku: string) {
    if (!sellerSku) {
      throw new BadRequestException('sellerSku es obligatorio');
    }

    const rows = await this.productSyncRepository.findMarketplaceSnapshotBySellerSku(sellerSku);

    if (rows.length === 0) {
      throw new NotFoundException(`No se encontraron marketplaces para sellerSku ${sellerSku}`);
    }

    return this.buildMarketplaceSnapshot(rows);
  }

  @Get('items/marketplaces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos los SKUs con snapshot por marketplace',
    description:
      'Devuelve SKUs paginados y, para cada uno, el detalle por marketplace con precio, stock y estado.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Cantidad de SKUs a devolver por página'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Offset de SKUs para paginación'
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de snapshots por sellerSku'
  })
  async listMarketplaceSnapshots(@Query('limit') limit = '10', @Query('offset') offset = '0') {
    const parsedLimit = Math.min(Number(limit) || 10, 100);
    const parsedOffset = Number(offset) || 0;

    const [rows, total] = await Promise.all([
      this.productSyncRepository.listMarketplaceSnapshotsBySellerSku(parsedLimit, parsedOffset),
      this.productSyncRepository.countDistinctSellerSkus()
    ]);

    const grouped = new Map<string, any[]>();

    for (const row of rows) {
      const key = row.seller_sku;
      const current = grouped.get(key) ?? [];
      current.push(row);
      grouped.set(key, current);
    }

    const items = Array.from(grouped.values()).map(group => this.buildMarketplaceSnapshot(group));

    return {
      items,
      limit: parsedLimit,
      offset: parsedOffset,
      count: items.length,
      total,
      hasNext: parsedOffset + parsedLimit < total,
      nextOffset: parsedOffset + parsedLimit < total ? parsedOffset + parsedLimit : null
    };
  }

  /* =====================================================
     HISTORIAL POR SELLER SKU
  ===================================================== */
  @Get('/:sellerSku')
  @ApiOperation({ summary: 'Historial completo por sellerSku' })
  @ApiParam({ name: 'sellerSku', description: 'SKU del vendedor' })
  async getHistoryBySellerSku(@Param('sellerSku') sellerSku: string) {
    if (!sellerSku) {
      throw new BadRequestException('sellerSku es obligatorio');
    }

    return this.productSyncRepository.findHistoryBySellerSku('megatone', sellerSku);
  }

  /* =====================================================
     UPDATE MANUAL (SELLER SKU)
  ===================================================== */
  @Put('/:sellerSku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar manualmente un producto sincronizado en sync_items',
    description:
      'Actualiza price / stock / status de un producto usando sellerSku. ' +
      'Registra historial automáticamente (en sync_history).'
  })
  @ApiParam({
    name: 'sellerSku',
    description: 'SKU del vendedor (ej: B0CYQHG3SS)'
  })
  @ApiBody({
    type: UpdateProductSyncItemDto,
    examples: {
      update: {
        value: {
          price: 6990000,
          stock: 3,
          status: 'ACTIVE',
          raw: {
            source: 'manual',
            reason: 'price correction'
          }
        }
      }
    }
  })
  async updateBySellerSku(
    @Param('sellerSku') sellerSku: string,
    @Body() body: Omit<UpdateProductSyncItemDto, 'sellerSku'>
  ) {
    await this.productSyncUpdateService.updateBySellerSku({
      sellerSku,
      ...body
    });

    return {
      status: 'UPDATED',
      sellerSku
    };
  }
  @Get('items/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar productos sincronizados por marketplace en sync_items',
    description: 'Devuelve el estado actual de los productos existentes en product_sync_items.'
  })
  @ApiQuery({
    name: 'marketplace',
    example: 'megatone',
    required: true
  })
  @ApiQuery({
    name: 'limit',
    example: 100,
    required: false
  })
  @ApiQuery({
    name: 'offset',
    example: 0,
    required: false
  })
  async listItems(
    @Query('marketplace') marketplace: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0'
  ) {
    if (!marketplace) {
      throw new BadRequestException('marketplace query param is required');
    }

    const parsedLimit = Math.min(Number(limit) || 100, 500);
    const parsedOffset = Number(offset) || 0;

    const [items, total, statusRows] = await Promise.all([
      this.productSyncRepository.listSyncItems(marketplace, parsedLimit, parsedOffset),
      this.productSyncRepository.countSyncItems(marketplace),
      this.productSyncRepository.countSyncItemsByStatus(marketplace)
    ]);

    return {
      items,
      limit: parsedLimit,
      offset: parsedOffset,
      count: items.length,
      total,
      summary: this.buildStatusSummary(marketplace, total, statusRows),
      hasNext: parsedOffset + parsedLimit < total,
      nextOffset: parsedOffset + parsedLimit < total ? parsedOffset + parsedLimit : null
    };
  }

  @Get(':marketplace/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resumen de productos por estado por marketplace en sync_items',
    description: `
Devuelve la cantidad de productos en **product_sync_items**
agrupados por estado para un marketplace determinado.

Estados incluidos:
- ACTIVE
- PAUSED
- PENDING
- ERROR
- DELETED
    `
  })
  @ApiParam({
    name: 'marketplace',
    example: 'megatone',
    description: 'Marketplace a consultar (ej: megatone, oncity, etc)',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de productos por estado',
    schema: {
      type: 'object',
      properties: {
        marketplace: {
          type: 'string',
          example: 'megatone'
        },
        total: {
          type: 'number',
          example: 1200
        },
        statuses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'ACTIVE'
              },
              total: {
                type: 'number',
                example: 376
              },
              percentage: {
                type: 'number',
                example: 31.33
              }
            }
          }
        },
        statusMap: {
          type: 'object',
          example: {
            ACTIVE: 376,
            PAUSED: 700,
            ERROR: 124
          }
        }
      }
    }
  })
  async getStatusSummary(@Param('marketplace') marketplace: string) {
    if (!marketplace) {
      throw new BadRequestException('marketplace es obligatorio');
    }

    const [total, rows] = await Promise.all([
      this.productSyncRepository.countSyncItems(marketplace),
      this.productSyncRepository.countSyncItemsByStatus(marketplace)
    ]);

    return this.buildStatusSummary(marketplace, total, rows);
  }

  @ApiOperation({
    summary: 'Check if a product exists by marketplace and sellerSku'
  })
  @ApiQuery({
    name: 'marketplace',
    example: 'megatone',
    required: true,
    description: 'Marketplace name'
  })
  @ApiQuery({
    name: 'sellerSku',
    example: 'B0CV2HGZPZ',
    required: true,
    description: 'Seller SKU'
  })
  @Get('items/exists')
  async existsBySellerSku(@Query('marketplace') marketplace: string, @Query('sellerSku') sellerSku: string) {
    if (!marketplace || !sellerSku) {
      throw new BadRequestException('marketplace and sellerSku are required');
    }

    const exists = await this.productSyncUpdateService.existsBySellerSku(marketplace, sellerSku);

    return { exists };
  }
}
