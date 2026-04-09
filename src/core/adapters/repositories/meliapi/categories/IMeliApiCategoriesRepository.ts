export interface IMeliApiCategoriesRepository {
  getCategoryPath(categoryId: string): Promise<string>;
}
