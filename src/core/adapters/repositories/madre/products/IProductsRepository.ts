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

export interface MeliProductImportData {
  sku: string;
  title: string;
  description: string;
  categoryPath: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  images: { position: number; url: string }[];
  categoryMLA?: string | null;
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

  /**
   * Bulk upsert products imported from mercadolibre_products.
   * Uses INSERT ... ON DUPLICATE KEY UPDATE keyed on `sku`.
   * @returns Number of affected rows
   */
  bulkUpsertFromMeliProducts(products: MeliProductImportData[]): Promise<number>;
}
