import { Inject, Injectable } from '@nestjs/common';
import { ISQLMercadoLibreProductsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsDetails/ISQLMercadoLibreProductsRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';

@Injectable()
export class MercadoLibreProductsService {
  constructor(
    @Inject('ISQLMercadoLibreProductsRepository')
    private readonly productsRepository: ISQLMercadoLibreProductsRepository
  ) {}

  /**
   * UPSERT bulk (insert + update)
   */
  async saveBulk(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<{ inserted: number }> {
    const { sellerId, products } = params;

    if (!products?.length) {
      return { inserted: 0 };
    }

    const inserted = await this.productsRepository.upsertBulkProducts({
      sellerId,
      products
    });

    return { inserted };
  }

  /**
   * Get paginated products
   */
  async getProducts(params: {
    sellerId: string;
    limit: number;
    offset: number;
    status?: string;
  }): Promise<PaginatedResult<MercadoLibreProduct>> {
    return this.productsRepository.findAll(
      {
        limit: params.limit,
        offset: params.offset
      },
      {
        sellerId: params.sellerId,
        status: params.status
      }
    );
  }
}
