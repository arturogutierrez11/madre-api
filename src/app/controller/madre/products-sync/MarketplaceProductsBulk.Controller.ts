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
  Query
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

  /* ====================================================
  BUSCAR CANTIDAD DE PRODUCTOS EN CADA ESTADO POR MARKETPLACE
  ======================================================*/

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
          }
        }
      }
    }
  })
  async getStatusSummary(@Param('marketplace') marketplace: string) {
    return this.productSyncRepository.countSyncItemsByStatus(marketplace);
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
      throw new Error('marketplace query param is required');
    }

    const parsedLimit = Math.min(Number(limit) || 100, 500);
    const parsedOffset = Number(offset) || 0;

    const items = await this.productSyncRepository.listSyncItems(marketplace, parsedLimit, parsedOffset);

    const total = await this.productSyncRepository.countSyncItems(marketplace);

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
}
