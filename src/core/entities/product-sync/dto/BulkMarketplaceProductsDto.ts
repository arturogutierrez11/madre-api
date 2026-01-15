import { ProductSyncMarketplace } from 'src/core/entities/product-sync/ProductSyncMarketplace';
import { ProductSyncStatus } from 'src/core/entities/product-sync/ProductSyncStatus';

export interface BulkMarketplaceProductsDto {
  marketplace: ProductSyncMarketplace;
  items: {
    externalId: string;
    sellerSku: string;
    marketplaceSku?: string | null;
    price: number;
    stock: number;
    status: ProductSyncStatus;
    raw: Record<string, any>;
  }[];
}
