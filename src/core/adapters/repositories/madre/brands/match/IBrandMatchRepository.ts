import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';

export interface IBrandMatchRepository {
  findAllBrandsMatch(limit: number, offset: number): Promise<BrandsMatchtoMarket[]>;
  countBrandsMatch(): Promise<number>;
}
