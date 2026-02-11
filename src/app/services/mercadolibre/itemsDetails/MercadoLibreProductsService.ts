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
   * Guarda o actualiza productos en bulk (UPSERT)
   */
  async saveBulk(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<{ inserted: number }> {
    if (!params.products?.length) {
      return { inserted: 0 };
    }

    const inserted = await this.productsRepository.upsertBulkProducts({
      sellerId: params.sellerId,
      products: params.products
    });

    return { inserted };
  }

  /**
   * Obtiene productos paginados
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
