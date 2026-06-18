import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

export interface IProductDeltaRepository {
  findChangesAfterId(afterId: number, limit: number): Promise<ProductDelta[]>;

  getRecentChangesSummary(minutes: number): Promise<{
    minutes: number;
    totalChanges: number;
    totalProducts: number;
    lastChangeAt: Date | null;
  }>;

  getRecentlyUpdatedProducts(
    minutes: number,
    limit: number,
    offset: number
  ): Promise<{
    items: Array<{
      productoId: number;
      sku: string;
      changesCount: number;
      lastChangeAt: Date | null;
      fields: string[];
    }>;
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    nextOffset: number | null;
  }>;
}
