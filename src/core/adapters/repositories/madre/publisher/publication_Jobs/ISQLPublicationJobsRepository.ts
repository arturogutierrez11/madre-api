import { UpdatePublicationJobDTO } from 'src/app/controller/madre/publisher/publication_Jobs/dto/UpdatePublicationJobDTO';

export interface ISQLPublicationJobsRepository {
  createMany(runId: number, jobs: { sku: string; marketplace: string }[]): Promise<number>;
  findPending(limit: number): Promise<any[]>;
  updateJob(id: number, data: UpdatePublicationJobDTO): Promise<void>;
  claimJobs(limit: number): Promise<any[]>;
  getRunProgress(runId: number): Promise<any>;
  getJobsByRun(runId: number, limit: number, offset: number, status?: string): Promise<any[]>;
  retryFailedJobs(runId: number): Promise<number>;
  incrementRunCounter(runId: number, field: 'success_jobs' | 'failed_jobs'): Promise<void>;
  findRunIdByJobId(jobId: number): Promise<number | null>;
  incrementTotalJobs(runId: number, count: number): Promise<void>;
}
