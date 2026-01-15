import { ProductSyncMarketplace } from './ProductSyncMarketplace';
import { ProductSyncStatus } from './ProductSyncStatus';

export interface ProductSyncItem {
  marketplace: ProductSyncMarketplace;

  externalId: string; // publicationId / skuId / etc
  sellerSku: string; // tu SKU / RefId
  marketplaceSku: string | null;

  price: number;
  stock: number;
  status: ProductSyncStatus;

  raw: Record<string, any>; // payload original del marketplace
}
