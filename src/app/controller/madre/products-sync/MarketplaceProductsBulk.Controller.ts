import { Body, Controller, HttpCode, HttpStatus, Inject, Post, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

import { IProductSyncRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRepository';
import { BulkMarketplaceProductsDto } from 'src/core/entities/product-sync/dto/BulkMarketplaceProductsDto';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';

@ApiTags('internal-marketplace')
@Controller('internal/marketplace/products')
export class MarketplaceProductsBulkController {
  constructor(
    @Inject('IProductSyncRepository')
    private readonly productSyncRepository: IProductSyncRepository
  ) {}

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Bulk upsert de productos de marketplace',
    description: 'Inserta o actualiza productos sincronizados desde marketplaces (uso interno)'
  })
  @ApiBody({
    description: 'Payload de productos sincronizados desde un marketplace',
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
            status: 'EN_REVISION',
            raw: {
              publicationId: 155562,
              title: 'Horno Tostador Nostalgia Oscar Mayer 8 Rodillos Grande',
              images: ['https://www.megatone.net/images/Articulos/zoom2x/356/MKT0001LQA-1.jpg']
            }
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 204,
    description: 'Productos procesados correctamente'
  })
  async bulkUpsert(@Body() body: BulkMarketplaceProductsDto): Promise<void> {
    if (!body.items || body.items.length === 0) {
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
}
