import { Inject, Injectable } from '@nestjs/common';
import {
  ISyncStatesRepository,
  SyncState
} from 'src/core/adapters/repositories/mercadolibre/sync/ISyncStatesRepository';

@Injectable()
export class SyncStatesService {
  constructor(
    @Inject('ISyncStatesRepository')
    private readonly repository: ISyncStatesRepository
  ) {}

  async getState(params: { processName: string; sellerId: string }): Promise<SyncState | null> {
    return this.repository.get(params);
  }

  async start(params: { processName: string; sellerId: string }): Promise<void> {
    await this.repository.upsert({
      processName: params.processName,
      sellerId: params.sellerId,
      lastOffset: 0,
      status: 'running'
    });
  }

  async updateOffset(params: { processName: string; sellerId: string; lastOffset: number }): Promise<void> {
    await this.repository.upsert({
      processName: params.processName,
      sellerId: params.sellerId,
      lastOffset: params.lastOffset,
      status: 'running'
    });
  }

  async markDone(params: { processName: string; sellerId: string; lastOffset: number }): Promise<void> {
    await this.repository.upsert({
      processName: params.processName,
      sellerId: params.sellerId,
      lastOffset: params.lastOffset,
      status: 'done'
    });
  }

  async markFailed(params: { processName: string; sellerId: string; lastOffset: number }): Promise<void> {
    await this.repository.upsert({
      processName: params.processName,
      sellerId: params.sellerId,
      lastOffset: params.lastOffset,
      status: 'failed'
    });
  }
}
