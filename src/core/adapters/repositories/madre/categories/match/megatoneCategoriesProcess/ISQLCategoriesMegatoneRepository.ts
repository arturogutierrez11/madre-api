export interface ISQLCategoriesMegatoneRepository {
  findByMeliCategoryId(meliCategoryId: string): Promise<any | null>;
  existsMeliCategoryMatch(meliCategoryId: string): Promise<boolean>;
  upsertMeliCategoryMatch(item: {
    meliCategoryId: string;
    meliCategoryPath: string;
    megatoneCategoryId: string;
    megatoneCategoryPath: string;
  }): Promise<void>;
  upsertManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      megatoneCategoryId: string;
      megatoneCategoryPath: string;
    }[]
  ): Promise<void>;
  findAllMeliCategoryMatches(limit?: number, offset?: number): Promise<any[]>;
}
