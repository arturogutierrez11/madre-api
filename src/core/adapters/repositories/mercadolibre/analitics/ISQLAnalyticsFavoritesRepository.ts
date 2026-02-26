import { FavoritesFiltersWithPagination } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsFavoritesRepository';

export interface ISQLAnalyticsFavoritesRepository {
  getFavorites(marketplaceId: number, filters?: FavoritesFiltersWithPagination);
  removeFavorite(marketplaceId: number, productId: string);
  removeFavoritesBulk(marketplaceId: number, productIds: string[]): Promise<{ success: boolean; deleted: number }>;
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
