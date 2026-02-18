import { FlatCategory, MercadoLibreCategory } from 'src/core/entities/mercadolibre/categories/MercadoLibreCategory';

export interface ISQLMercadoLibreCategoriesRepository {
  upsertMany(categories: FlatCategory[]): Promise<void>;

  findById(id: string): Promise<MercadoLibreCategory | null>;

  findChildren(parentId: string | null): Promise<MercadoLibreCategory[]>;

  findTree(): Promise<MercadoLibreCategory[]>;

  findSubTree(categoryId: string): Promise<MercadoLibreCategory[]>;
}
