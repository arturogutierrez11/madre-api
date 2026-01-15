import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';

export interface IProductSyncRepository {
  bulkUpsert(items: ProductSyncItem[]): Promise<void>;
}
