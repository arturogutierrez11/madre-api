/* =====================================================
   START RUN
===================================================== */

export interface StartProductSyncRunDto {
  marketplace: string;
}

export interface StartProductSyncRunResponseDto {
  runId: string;
  status: 'RUNNING';
  startedAt: string; // ISO string
}

/* =====================================================
   UPDATE PROGRESS
===================================================== */

export interface UpdateProductSyncRunProgressDto {
  runId: string;
  batches?: number;
  items?: number;
  failed?: number;
}

/* =====================================================
   FINISH RUN
===================================================== */

export interface FinishProductSyncRunDto {
  runId: string;
  status: 'SUCCESS' | 'PARTIAL';
}

export interface FinishProductSyncRunResponseDto {
  runId: string;
  status: 'SUCCESS' | 'PARTIAL';
  finishedAt: string;
}

/* =====================================================
   FAIL RUN
===================================================== */

export interface FailProductSyncRunDto {
  runId: string;
  errorMessage: string;
}

export interface FailProductSyncRunResponseDto {
  runId: string;
  status: 'FAILED';
  errorMessage: string;
  finishedAt: string;
}

/* =====================================================
   LIST RUNS
===================================================== */

export type ProductSyncRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface ProductSyncRunDto {
  id: string;
  marketplace: string;
  status: ProductSyncRunStatus;

  batches_processed: number;
  items_processed: number;
  items_failed: number;

  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export interface ListProductSyncRunsResponseDto {
  items: ProductSyncRunDto[];
  limit: number;
  offset: number;
}
