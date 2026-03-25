import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { IPublicationRunRepository } from 'src/core/adapters/repositories/madre/publisher/publication_Run/IPublicationRunRepository';
import { CreatePublicationRunDTO } from 'src/core/entities/madre/publisher/publication_Run/PublicationRun';

@Injectable()
export class PublicationRunService {
  constructor(
    @Inject('IPublicationRunRepository')
    private readonly repository: IPublicationRunRepository
  ) {}

  async execute(data: CreatePublicationRunDTO) {
    const run = await this.repository.create(data);

    return {
      run_id: run.id,
      status: run.status
    };
  }

  async getRun(id: number) {
    try {
      const run = await this.repository.findById(id);
      return run;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error get Run ');
    }
  }

  async listRuns() {
    try {
      return await this.repository.findAll();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error listing runs');
    }
  }

  async cancelRun(runId: number) {
    const jobsCancelled = await this.repository.cancelRun(runId);

    await this.repository.updateRunStatus(runId, 'cancelled');

    return {
      status: 'cancelled',
      jobs_cancelled: jobsCancelled
    };
  }
}
