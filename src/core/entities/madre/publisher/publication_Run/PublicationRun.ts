export interface PublicationRun {
  id: number;
  status: string;
  marketplaces: string[];
  total_jobs: number;
  success_jobs: number;
  failed_jobs: number;
  created_at: Date;
  started_at?: Date | null;
  finished_at?: Date | null;
}

export interface CreatePublicationRunDTO {
  marketplaces: string[];
}
