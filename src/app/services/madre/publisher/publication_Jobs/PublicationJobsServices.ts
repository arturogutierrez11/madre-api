import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePublicationJobsDTO } from 'src/app/controller/madre/publisher/publication_Jobs/dto/CreatePublicationJobs.dto';
import { UpdatePublicationJobDTO } from 'src/app/controller/madre/publisher/publication_Jobs/dto/UpdatePublicationJobDTO';
import { ISQLPublicationJobsRepository } from 'src/core/adapters/repositories/madre/publisher/publication_Jobs/ISQLPublicationJobsRepository';

@Injectable()
export class PublicationJobsServices {
  private static readonly MAX_CLAIM_JOBS = 50;

  constructor(
    @Inject('ISQLPublicationJobsRepository')
    private readonly repository: ISQLPublicationJobsRepository
  ) {}

  async execute(data: CreatePublicationJobsDTO) {
    if (!data.run_id) {
      throw new Error('run_id is required');
    }

    if (!data.jobs || !Array.isArray(data.jobs)) {
      throw new Error('jobs must be an array');
    }

    if (data.jobs.length === 0) {
      return {
        status: 'ok',
        jobs_created: 0
      };
    }

    const count = await this.repository.createMany(data.run_id, data.jobs);
    await this.repository.incrementTotalJobs(data.run_id, count);

    return {
      status: 'ok',
      jobs_created: count
    };
  }

  async findPendingJobs(limit = 10) {
    try {
      return await this.repository.findPending(limit);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error retrieving pending jobs');
    }
  }

  async claimJobs(limit?: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || PublicationJobsServices.MAX_CLAIM_JOBS, 1), PublicationJobsServices.MAX_CLAIM_JOBS);

    const items = await this.repository.claimJobs(safeLimit);

    return {
      requested: Number(limit) || PublicationJobsServices.MAX_CLAIM_JOBS,
      limit: safeLimit,
      claimed: items.length,
      items
    };
  }

  async getRunProgress(runId: number) {
    return this.repository.getRunProgress(runId);
  }

  async getJobsByRun(runId: number, limit: number, offset: number, status?: string) {
    return this.repository.getJobsByRun(runId, limit, offset, status);
  }

  async retryFailedJobs(runId: number) {
    const count = await this.repository.retryFailedJobs(runId);

    return {
      status: 'ok',
      jobs_retried: count
    };
  }

  async updateJob(id: number, data: UpdatePublicationJobDTO) {
    try {
      await this.repository.updateJob(id, data);

      const runId = await this.repository.findRunIdByJobId(id);

      if (!runId) {
        return { status: 'ok' };
      }

      if (data.status === 'success') {
        await this.repository.incrementRunCounter(runId, 'success_jobs');
      }

      if (data.status === 'failed') {
        await this.repository.incrementRunCounter(runId, 'failed_jobs');
      }

      return { status: 'ok' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error updating job');
    }
  }
}
