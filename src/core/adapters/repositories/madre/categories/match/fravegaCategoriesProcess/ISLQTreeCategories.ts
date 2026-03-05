export interface ISLQTreeCategories {
  getCategoriesTree(): Promise<any[]>;
  getCategoryAttributes(categoryId: string): Promise<any[]>;
}
