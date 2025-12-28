import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { CategoryMadre } from 'src/core/entities/madre/categories/CategoryMadre';

export interface ICategoriesMadreRepository {
  findCategoriesFromMadreDB(pagination: PaginationParams): Promise<PaginatedResult<CategoryMadre>>;
}
