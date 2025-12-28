import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';

export interface ICategoryMatchRepository {
  findAllCategoriesMatch(limit: number, offset: number): Promise<CategoriesMatchToMarket[]>;
  countCategoriesMatch(): Promise<number>;
}
