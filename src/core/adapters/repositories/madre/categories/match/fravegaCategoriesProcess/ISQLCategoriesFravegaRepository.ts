export interface ISQLCategoriesFravegaRepository {
  getCategoriesTree(): Promise<any[]>;
  getCategoryAttributes(categoryId: string): Promise<any[]>;
  findByMeliCategoryId(meliCategoryId: string);
  existsMeliCategoryMatch(meliCategoryId: string): Promise<boolean>;
  upsertMeliCategoryMatch(item: {
    meliCategoryId: string;
    meliCategoryPath: string;
    fravegaCategoryId: string;
    fravegaCategoryPath: string;
  }): Promise<void>;
  upsertManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }[]
  ): Promise<void>;
  findAllMeliCategoryMatches(limit: number, offset: number);
}
