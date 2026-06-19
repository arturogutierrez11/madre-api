import { Inject, Injectable } from '@nestjs/common';
import { IGoogleMerchantProductsRepository } from 'src/core/adapters/repositories/google-merchant/IGoogleMerchantProductsRepository';

@Injectable()
export class GoogleMerchantProductsService {
  constructor(
    @Inject('IGoogleMerchantProductsRepository')
    private readonly repository: IGoogleMerchantProductsRepository
  ) {}

  async findActiveProducts(limit: number, offset: number) {
    const safeLimit = Math.min(500, Math.max(1, Math.trunc(Number(limit) || 50)));
    const safeOffset = Math.max(0, Math.trunc(Number(offset) || 0));

    const [items, total] = await Promise.all([
      this.repository.findActiveProducts(safeLimit, safeOffset),
      this.repository.countActiveProducts()
    ]);

    return {
      items,
      total,
      limit: safeLimit,
      offset: safeOffset,
      count: items.length,
      hasNext: safeOffset + safeLimit < total,
      nextOffset: safeOffset + safeLimit < total ? safeOffset + safeLimit : null
    };
  }
}
