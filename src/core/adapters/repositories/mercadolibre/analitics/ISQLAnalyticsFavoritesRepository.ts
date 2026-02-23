export interface ISQLAnalyticsFavoritesRepository {
  getFavorites(marketplaceId: number);
  removeFavorite(marketplaceId: number, productId: string);
  addFavorite(marketplaceId: number, productId: string, sellerSku: string);
  addFavoritesBulk(
    marketplaceId: number,
    items: { productId: string; sellerSku: string }[]
  ): Promise<{ success: boolean; inserted: number }>;
  getMarketplaces();
  createMarketplace(name: string);
}
