export type ProductSyncRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface ProductSyncRun {
  id: string;
  marketplace: string;

  status: ProductSyncRunStatus;

  startedAt: Date;
  finishedAt: Date | null;

  batchesProcessed: number;
  itemsProcessed: number;
  itemsFailed: number;

  errorMessage?: string | null;
}
