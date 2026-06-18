import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProductDeltaRepository } from 'src/core/adapters/repositories/madre/delta/IProductDeltaRepository';
import { IProductDeltaCursorRepository } from 'src/core/adapters/repositories/product-delta/IProductDeltaCursorRepository';
import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

@Injectable()
export class ProductDeltaService {
  constructor(
    @Inject('IProductDeltaRepository')
    private readonly productDeltaRepository: IProductDeltaRepository,

    @Inject('IProductDeltaCursorRepository')
    private readonly cursorRepository: IProductDeltaCursorRepository
  ) {}

  async getChanges(
    afterId: number,
    limit: number
  ): Promise<{ items: ProductDelta[]; lastId: number | null; hasMore: boolean }> {
    const rows = await this.productDeltaRepository.findChangesAfterId(afterId, limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastId = items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      lastId,
      hasMore
    };
  }

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

  async getRecentChangesSummary(minutes: number) {
    const safeMinutes = Math.max(1, Math.min(7 * 24 * 60, Math.trunc(Number(minutes) || 360)));
    return this.productDeltaRepository.getRecentChangesSummary(safeMinutes);
  }

  async getRecentlyUpdatedProducts(minutes: number, limit: number, offset: number) {
    const safeMinutes = Math.max(1, Math.min(7 * 24 * 60, Math.trunc(Number(minutes) || 360)));
    const safeLimit = Math.min(5000, Math.max(1, Math.trunc(Number(limit) || 100)));
    const safeOffset = Math.max(0, Math.trunc(Number(offset) || 0));

    return this.productDeltaRepository.getRecentlyUpdatedProducts(safeMinutes, safeLimit, safeOffset);
  }
}
