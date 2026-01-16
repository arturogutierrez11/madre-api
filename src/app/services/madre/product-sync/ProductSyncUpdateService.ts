import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { SQLProductSyncRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRepository';
import { UpdateProductSyncItemDto } from 'src/core/entities/product-sync/dto/UpdateProductSyncItemDto';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';
import { ProductSyncMarketplace } from 'src/core/entities/product-sync/ProductSyncMarketplace';
import { ProductSyncStatus } from 'src/core/entities/product-sync/ProductSyncStatus';

@Injectable()
export class ProductSyncUpdateService {
  private readonly MARKETPLACE: ProductSyncMarketplace = 'megatone';

  constructor(private readonly productSyncRepository: SQLProductSyncRepository) {}

  async updateBySellerSku(dto: UpdateProductSyncItemDto): Promise<void> {
    if (!dto.sellerSku) {
      throw new BadRequestException('sellerSku es obligatorio');
    }

    const current = await this.productSyncRepository.findItemBySellerSku(this.MARKETPLACE, dto.sellerSku);

    if (!current) {
      throw new NotFoundException(`No existe product_sync_item para sellerSku ${dto.sellerSku} en ${this.MARKETPLACE}`);
    }

    const updatedItem: ProductSyncItem = {
      marketplace: this.MARKETPLACE,

      externalId: String(current.external_id),
      sellerSku: current.seller_sku,
      marketplaceSku: current.marketplace_sku ?? null,

      price: dto.price ?? Number(current.price),
      stock: dto.stock ?? Number(current.stock),
      status: (dto.status ?? current.status) as ProductSyncStatus,

      raw: dto.raw ? dto.raw : JSON.parse(current.raw_payload ?? '{}')
    };

    await this.productSyncRepository.bulkUpsert([updatedItem]);
  }
}
