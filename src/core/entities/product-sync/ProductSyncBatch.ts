import { ProductSyncItem } from './ProductSyncItem';
import { ProductSyncMarketplace } from './ProductSyncMarketplace';

export interface ProductSyncBatch {
  marketplace: ProductSyncMarketplace;
  syncedAt: Date;
  items: ProductSyncItem[];
}
