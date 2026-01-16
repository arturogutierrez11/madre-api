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
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';

import { IProductSyncRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRepository';
import { BulkMarketplaceProductsDto } from 'src/core/entities/product-sync/dto/BulkMarketplaceProductsDto';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';
import { UpdateProductSyncItemDto } from 'src/core/entities/product-sync/dto/UpdateProductSyncItemDto';
import { ProductSyncUpdateService } from 'src/app/services/madre/product-sync/ProductSyncUpdateService';

@ApiTags('Procesos internos · Sincronización de Productos')
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

  /* =====================================================
     UPDATE MANUAL (SELLER SKU)
  ===================================================== */
  @Put('/:sellerSku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar manualmente un producto sincronizado',
    description:
      'Actualiza price / stock / status de un producto usando sellerSku. ' + 'Registra historial automáticamente.'
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
  @ApiOperation({
    summary: 'Listar productos sincronizados del marketplace',
    description:
      'Devuelve el estado actual de los productos existentes en product_sync_items. ' +
      'Usado por procesos FULL y DELTA para comparar contra Madre.'
  })
  async listItems(
    @Query('marketplace') marketplace = 'megatone',
    @Query('limit') limit = '100',
    @Query('offset') offset = '0'
  ) {
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
