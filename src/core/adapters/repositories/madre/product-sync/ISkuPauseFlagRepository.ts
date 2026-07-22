export interface SkuPauseFlagRecord {
  id: number;
  sku: string;
  paused: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListSkuPauseFlagsFilters {
  sku?: string;
  paused?: boolean;
  limit: number;
  offset: number;
}

export interface ISkuPauseFlagRepository {
  upsert(sku: string, paused: boolean): Promise<SkuPauseFlagRecord>;
  bulkUpsert(items: Array<{ sku: string; paused: boolean }>): Promise<SkuPauseFlagRecord[]>;
  findBySku(sku: string): Promise<SkuPauseFlagRecord | null>;
  findBySkus(skus: string[]): Promise<Array<{ sku: string; paused: boolean }>>;
  list(filters: ListSkuPauseFlagsFilters): Promise<{
    items: SkuPauseFlagRecord[];
    limit: number;
    offset: number;
    total: number;
    count: number;
    hasNext: boolean;
    nextOffset: number | null;
  }>;
  deleteBySku(sku: string): Promise<boolean>;
}
