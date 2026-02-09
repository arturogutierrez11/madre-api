import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

export interface ISQLMercadoLibreItemsRepository {
  insertBulkItems(params: { sellerId: string; items: string[]; status: string }): Promise<number>;

  findAll(
    pagination: PaginationParams,
    filters?: {
      sellerId?: string;
      status?: string;
    }
  ): Promise<PaginatedResult<string>>;
}
