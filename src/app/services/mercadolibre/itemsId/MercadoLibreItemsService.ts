import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { ISQLMercadoLibreItemsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsId/ISQLMercadoLibreItemsRepository';

@Injectable()
export class MercadoLibreItemsService {
  constructor(
    @Inject('ISQLMercadoLibreItemsRepository')
    private readonly itemsRepository: ISQLMercadoLibreItemsRepository
  ) {}

  async saveItemsBulk(params: { sellerId: string; items: string[]; status: string }): Promise<{ inserted: number }> {
    const { sellerId, items, status } = params;

    if (!sellerId) {
      throw new BadRequestException('sellerId is required');
    }

    if (!status) {
      throw new BadRequestException('status is required');
    }

    if (!items || items.length === 0) {
      return { inserted: 0 };
    }

    const inserted = await this.itemsRepository.insertBulkItems({
      sellerId,
      items,
      status
    });

    return { inserted };
  }

  async getItemsPaginated(
    pagination: PaginationParams,
    filters?: { sellerId?: string; status?: string }
  ): Promise<PaginatedResult<string>> {
    return this.itemsRepository.findAll(pagination, filters);
  }
}
