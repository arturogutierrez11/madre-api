import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { SQLProductSyncRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRepository';
import { UpdateProductSyncItemDto } from 'src/core/entities/product-sync/dto/UpdateProductSyncItemDto';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';
import { ProductSyncMarketplace } from 'src/core/entities/product-sync/ProductSyncMarketplace';
import { ProductSyncStatus } from 'src/core/entities/product-sync/ProductSyncStatus';

@Injectable()
export class ProductSyncUpdateService {
  constructor(private readonly productSyncRepository: SQLProductSyncRepository) {}

  async updateBySellerSku(dto: UpdateProductSyncItemDto): Promise<void> {
    if (!dto.sellerSku) {
      throw new BadRequestException('sellerSku es obligatorio');
    }

    const current = await this.productSyncRepository.findItemBySellerSku('megatone', dto.sellerSku);

    /* =====================================================
       CASO 1: NO EXISTE → INSERTAR
    ===================================================== */
    if (!current) {
      const newItem: ProductSyncItem = {
        marketplace: 'megatone',
        externalId: `UNKNOWN-${dto.sellerSku}`,
        sellerSku: dto.sellerSku,
        marketplaceSku: null,

        price: dto.price ?? 0,
        stock: dto.stock ?? 0,
        status: 'ERROR',

        raw: {
          source: 'manual-not-in-madre',
          reason: 'Item no existe en product_sync_items',
          payload: dto.raw ?? {}
        }
      };

      await this.productSyncRepository.bulkUpsert([newItem]);
      return;
    }

    /* =====================================================
       CASO 2: EXISTE → UPDATE NORMAL
    ===================================================== */
    const updatedItem: ProductSyncItem = {
      marketplace: current.marketplace as ProductSyncMarketplace,
      externalId: String(current.external_id),
      sellerSku: current.seller_sku,
      marketplaceSku: current.marketplace_sku,

      price: dto.price ?? Number(current.price),
      stock: dto.stock ?? Number(current.stock),
      status: (dto.status ?? current.status) as ProductSyncStatus,

      raw: dto.raw ?? JSON.parse(current.raw_payload ?? '{}')
    };

    await this.productSyncRepository.bulkUpsert([updatedItem]);
  }
}
