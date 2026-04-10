import { Inject, Injectable } from '@nestjs/common';
import { IProductDeltaRepository } from 'src/core/adapters/repositories/madre/delta/IProductDeltaRepository';
import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

@Injectable()
export class ProductDeltaService {
  constructor(
    @Inject('IProductDeltaRepository')
    private readonly productDeltaRepository: IProductDeltaRepository
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
}
