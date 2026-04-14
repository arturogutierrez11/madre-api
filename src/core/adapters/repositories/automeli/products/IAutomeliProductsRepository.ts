import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

export interface AutomeliPaginatedResponse {
  data: AutomeliProduct[];
  next_cursor: string | null;
  has_more: boolean;
  count: number;
}

export interface IAutomeliProductsRepository {
  getLoadedProducts(params: {
    sellerId: string;
    appStatus?: number;
    cursor?: string;
  }): Promise<AutomeliPaginatedResponse>;
}
