import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';
import { PaginatedResult } from 'src/core/entities/mercadolibre/itemsId/PaginatedResult';

export interface ISQLMercadoLibreProductsRepository {
  upsertBulkProducts(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<number>;

  findAll(
    { limit, offset }: { limit: number; offset: number },
    filters?: { sellerId?: string; status?: string }
  ): Promise<PaginatedResult<any>>;
  updateFullBulkProducts(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<number>;
}
