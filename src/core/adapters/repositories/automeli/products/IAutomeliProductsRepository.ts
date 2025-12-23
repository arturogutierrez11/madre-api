import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

export interface IAutomeliProductsRepository {
  getLoadedProducts(params: { sellerId: string; appStatus?: number; aux?: number }): Promise<AutomeliProduct[]>;
}
