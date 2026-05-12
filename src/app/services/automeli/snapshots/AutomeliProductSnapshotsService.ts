import { Inject, Injectable } from '@nestjs/common';
import {
  AutomeliProductSnapshotRecord,
  IAutomeliProductSnapshotsRepository
} from 'src/core/adapters/repositories/automeli/snapshots/IAutomeliProductSnapshotsRepository';

@Injectable()
export class AutomeliProductSnapshotsService {
  constructor(
    @Inject('IAutomeliProductSnapshotsRepository')
    private readonly snapshotsRepository: IAutomeliProductSnapshotsRepository
  ) {}

  async findBySkus(skus: string[]): Promise<{ items: AutomeliProductSnapshotRecord[]; total: number }> {
    const items = await this.snapshotsRepository.findBySkus(skus);
    return {
      items,
      total: items.length
    };
  }
}
