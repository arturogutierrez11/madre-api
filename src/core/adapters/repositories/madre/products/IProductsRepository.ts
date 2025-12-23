import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { ProductMadre } from 'src/core/entities/madre/products/ProductMadre';

export interface IProductsRepository {
  findAll(pagination: PaginationParams): Promise<PaginatedResult<ProductMadre>>;
}
