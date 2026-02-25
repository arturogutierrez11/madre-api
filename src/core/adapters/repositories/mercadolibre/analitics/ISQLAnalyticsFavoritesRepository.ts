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

  getMarketplaceOverview(marketplaceId: number): Promise<{
    totalProducts: number;
    totalVisits: number;
    totalOrders: number;
    totalRevenue: number;
    avgPrice: number;
    avgTicket: number;
    totalBrands: number;
    totalCategories: number;
  }>;
  getMarketplaceBrandsBreakdown(marketplaceId: number);
  getMarketplaceCategoriesBreakdown(marketplaceId: number);
  getMarketplaceById(id: number);
  updateMarketplaceStatus(id: number, status: 'active' | 'closed');
  deleteMarketplace(id: number): Promise<{ success: boolean }>;
}
