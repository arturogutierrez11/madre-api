import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProductDeltaCursorRepository } from 'src/core/adapters/repositories/product-delta/IProductDeltaCursorRepository';

@Injectable()
export class ProductDeltaService {
  constructor(
    @Inject('IProductDeltaCursorRepository')
    private readonly cursorRepository: IProductDeltaCursorRepository
  ) {}

  async getCursor(syncKey: string): Promise<{ sync_key: string; last_delta_id: number }> {
    if (!syncKey) throw new BadRequestException('sync_key is required');

    const lastDeltaId = await this.cursorRepository.getCursor(syncKey);

    return { sync_key: syncKey, last_delta_id: lastDeltaId };
  }

  async updateCursor(syncKey: string, lastDeltaId: number): Promise<{ sync_key: string; last_delta_id: number }> {
    await this.cursorRepository.updateCursor(syncKey, lastDeltaId);

    const updated = await this.cursorRepository.getCursor(syncKey);

    return { sync_key: syncKey, last_delta_id: updated };
  }
}
