import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { ProductMadre } from 'src/core/entities/madre/products/ProductMadre';

export interface AutomeliBulkUpdateData {
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  shippingTime: number | null;
}

export interface IProductsRepository {
  findAll(
    pagination: PaginationParams,
    filters?: {
      sku?: string;
    }
  ): Promise<PaginatedResult<ProductMadre>>;

  /**
   * Bulk update products from Automeli sync data
   * Uses INSERT ... ON DUPLICATE KEY UPDATE for efficiency
   * @returns Number of affected rows
   */
  bulkUpdateFromAutomeli(products: AutomeliBulkUpdateData[]): Promise<number>;
}
