export interface PublicationRun {
  id: number;
  status: string;
  marketplaces: string[];
  total_jobs: number;
  pending_jobs?: number;
  processing_jobs?: number;
  success_jobs: number;
  failed_jobs: number;
  skipped_jobs?: number;
  cancelled_jobs?: number;
  retry_jobs?: number;
  created_at: Date;
  started_at?: Date | null;
  finished_at?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreatePublicationRunDTO {
  marketplaces: string[];
}
