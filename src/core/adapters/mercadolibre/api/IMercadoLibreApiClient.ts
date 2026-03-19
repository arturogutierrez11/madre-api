export interface MeliItemDescription {
  plainText: string;
}

export interface IMercadoLibreApiClient {
  getItemDescription(itemId: string): Promise<MeliItemDescription>;
  getCategoryPath(categoryId: string): Promise<string>;
}
