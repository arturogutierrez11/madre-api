import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';

export interface IProductSyncRepository {
  /* ======================================
     UPSERT
  ====================================== */
  bulkUpsert(items: ProductSyncItem[]): Promise<void>;

  /* ======================================
     ITEM
  ====================================== */
  findItemById(id: string): Promise<any | null>;
  findItemBySellerSku(marketplace: string, sellerSku: string): Promise<any | null>;

  /* ======================================
     HISTORY
  ====================================== */
  findHistoryByProductSyncItemId(productSyncItemId: string): Promise<any[]>;
  findHistoryByStatus(productSyncItemId: string, status: string): Promise<any[]>;

  findHistoryBySellerSku(marketplace: string, sellerSku: string): Promise<any[]>;
  findHistoryBySellerSkuAndStatus(marketplace: string, sellerSku: string, status: string): Promise<any[]>;
}
