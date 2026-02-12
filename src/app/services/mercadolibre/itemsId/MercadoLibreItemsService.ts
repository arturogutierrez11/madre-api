import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ISQLMercadoLibreItemsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsId/ISQLMercadoLibreItemsRepository';
import { CursorPaginatedResult } from 'src/core/entities/mercadolibre/itemsId/PaginatedResult';

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

    if (!items?.length) {
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
    pagination: { limit: number; lastId?: number },
    filters?: { sellerId?: string; status?: string }
  ): Promise<CursorPaginatedResult<string>> {
    return this.itemsRepository.findAll(pagination, filters);
  }
}
