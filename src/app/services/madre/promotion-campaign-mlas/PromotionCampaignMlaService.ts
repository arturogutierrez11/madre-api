import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPromotionCampaignMlaRepository } from 'src/core/adapters/repositories/central-promos/IPromotionCampaignMlaRepository';

@Injectable()
export class PromotionCampaignMlaService {
  constructor(
    @Inject('IPromotionCampaignMlaRepository')
    private readonly repository: IPromotionCampaignMlaRepository
  ) {}

  async create(mla: string) {
    const normalizedMla = this.requireValidMla(mla);
    return this.repository.create(normalizedMla);
  }

  async createBulk(mlas: string[]) {
    const normalizedMlas = this.requireValidMlas(mlas);
    return this.repository.createBulk(normalizedMlas);
  }

  async checkExistsBulk(mlas: string[]) {
    const normalizedMlas = this.requireValidMlas(mlas, 100);
    return this.repository.checkExistsBulk(normalizedMlas);
  }

  async list(limit: number, offset: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safeOffset = Math.max(Number(offset) || 0, 0);
    const [items, total] = await Promise.all([
      this.repository.list(safeLimit, safeOffset),
      this.repository.count()
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

  private requireValidMla(mla: string): string {
    const normalized = String(mla ?? '').trim().toUpperCase();

    if (!normalized) {
      throw new BadRequestException('mla is required');
    }

    return normalized;
  }

  private requireValidMlas(mlas: string[], maxItems = 1000): string[] {
    const normalized = [...new Set(
      (mlas ?? [])
        .map(mla => String(mla ?? '').trim().toUpperCase())
        .filter(Boolean)
    )];

    if (!normalized.length) {
      throw new BadRequestException('mlas must contain at least one item');
    }

    if (normalized.length > maxItems) {
      throw new BadRequestException(`mlas must contain at most ${maxItems} items`);
    }

    return normalized;
  }
}
