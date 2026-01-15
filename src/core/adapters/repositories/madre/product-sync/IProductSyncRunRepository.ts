import { ProductSyncRunDto } from 'src/core/entities/product-sync/runs/dto/ProductSyncRunDtos';

export interface IProductSyncRunRepository {
  start(marketplace: string): Promise<string>;
  increment(runId: string, data: { batches?: number; items?: number; failed?: number }): Promise<void>;
  finish(runId: string, status: 'SUCCESS' | 'PARTIAL'): Promise<void>;
  fail(runId: string, errorMessage: string): Promise<void>;

  list(marketplace: string, limit: number, offset: number): Promise<ProductSyncRunDto[]>;
}
