import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';

export interface IBrandMatchRepository {
  findAllBrandsMatch(limit: number, offset: number): Promise<BrandsMatchtoMarket[]>;
  countBrandsMatch(): Promise<number>;
  upsertBrandMatch(item: BrandsMatchtoMarket): Promise<void>;
  upsertManyBrandMatch(items: BrandsMatchtoMarket[]): Promise<void>;
}
