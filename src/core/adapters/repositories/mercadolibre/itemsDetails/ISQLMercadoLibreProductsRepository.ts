import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';

export interface ISQLMercadoLibreProductsRepository {
  upsertBulkProducts(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<number>;

  findAll(
    params: { limit: number; offset: number },
    filters?: { sellerId?: string; status?: string }
  ): Promise<PaginatedResult<any>>;
}
