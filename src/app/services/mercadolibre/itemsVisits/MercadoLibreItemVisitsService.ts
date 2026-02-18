import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ISQLMercadoLibreItemVisitsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsVisits/ISQLMercadoLibreItemVisitsRepository';
import { PaginatedResult } from 'src/core/entities/mercadolibre/itemsVisits/PaginatedResult';
import { MercadoLibreItemVisit } from 'src/core/entities/mercadolibre/itemsVisits/MercadoLibreItemVisit';

@Injectable()
export class MercadoLibreItemVisitsService {
  constructor(
    @Inject('ISQLMercadoLibreItemVisitsRepository')
    private readonly visitsRepository: ISQLMercadoLibreItemVisitsRepository
  ) {}

  // ─────────────────────────────────────────────
  // UPSERT VISIT
  // ─────────────────────────────────────────────
  async saveVisit(params: { itemId: string; totalVisits: number }): Promise<{ saved: boolean }> {
    const { itemId, totalVisits } = params;

    if (!itemId) {
      throw new BadRequestException('itemId is required');
    }

    if (totalVisits === undefined || totalVisits === null) {
      throw new BadRequestException('totalVisits is required');
    }

    await this.visitsRepository.upsert({
      itemId,
      totalVisits
    });

    return { saved: true };
  }

  // ─────────────────────────────────────────────
  // GET ONE
  // ─────────────────────────────────────────────
  async getByItemId(itemId: string): Promise<MercadoLibreItemVisit | null> {
    if (!itemId) {
      throw new BadRequestException('itemId is required');
    }

    return this.visitsRepository.findByItemId(itemId);
  }

  // ─────────────────────────────────────────────
  // GET PAGINATED
  // ─────────────────────────────────────────────
  async getPaginated(pagination: { limit: number; offset: number }): Promise<PaginatedResult<MercadoLibreItemVisit>> {
    const { limit, offset } = pagination;

    if (!limit || limit <= 0) {
      throw new BadRequestException('limit must be greater than 0');
    }

    if (offset < 0) {
      throw new BadRequestException('offset must be >= 0');
    }

    return this.visitsRepository.findAll({ limit, offset });
  }
}
