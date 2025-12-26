import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

export interface IBrandsMadreRepository {
  findBrandsFromMadreDB(pagination: PaginationParams): Promise<PaginatedResult<string>>;
}
