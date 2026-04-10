import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

export interface IProductDeltaRepository {
  findChangesAfterId(afterId: number, limit: number): Promise<ProductDelta[]>;
}
