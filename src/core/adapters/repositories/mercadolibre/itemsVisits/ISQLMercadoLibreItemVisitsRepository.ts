import { MercadoLibreItemVisit } from 'src/core/entities/mercadolibre/itemsVisits/MercadoLibreItemVisit';
import { PaginatedResult } from 'src/core/entities/mercadolibre/itemsVisits/PaginatedResult';

export interface ISQLMercadoLibreItemVisitsRepository {
  upsert(params: { itemId: string; totalVisits: number }): Promise<void>;

  findByItemId(itemId: string): Promise<MercadoLibreItemVisit | null>;

  findAll(pagination: { limit: number; offset: number }): Promise<PaginatedResult<MercadoLibreItemVisit>>;
}
