export interface ISQLAnalyticsFavoritesRepository {
  getFavorites(marketplaceId: number);
  removeFavorite(marketplaceId: number, productId: string);
  addFavorite(marketplaceId: number, productId: string, sellerSku: string);
  getMarketplaces();
  createMarketplace(name: string);
}
