import {
  CreatePublicationRunDTO,
  PublicationRun
} from 'src/core/entities/madre/publisher/publication_Run/PublicationRun';

export interface IPublicationRunRepository {
  create(data: CreatePublicationRunDTO): Promise<PublicationRun>;
  findById(id: number): Promise<PublicationRun | null>;
  findAll(): Promise<any[]>;
  updateStatus(id: number, status: string): Promise<void>;
  //findById(id: number): Promise<any | null>;
  updateRunStatus(runId: number, status: string): Promise<void>;
  cancelRun(runId: number): Promise<number>;
}
