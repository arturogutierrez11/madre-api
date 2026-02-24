export type AnalyticsProductsFilters = {
  brand?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minVisits?: number;
  maxVisits?: number;
  minOrders?: number;
  maxOrders?: number;
  excludeMarketplace?: string[];
  inMarketplace?: number;
  marketplaceStatus?: 'published' | 'not_published';
};

export interface IAnalyticsProductsRepository {
  /* ===== OVERVIEW ===== */
  getProductsOverview(params: AnalyticsProductsFilters): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalVisits: number;
    totalRevenue: number;
    avgPrice: number;
    avgTicket: number;
  }>;

  /* ===== FAVORITOS SIMPLE ===== */
  saveSelectionToFolder(marketplaceId: number, filters: AnalyticsProductsFilters): Promise<{ success: boolean }>;

  /* ===== SEGMENTOS (NUEVO SISTEMA) ===== */
  saveSelectionAsSegment(
    marketplaceId: number,
    filters: AnalyticsProductsFilters
  ): Promise<{
    success: boolean;
    segmentId: number;
    totalProducts: number;
  }>;

  /* ===== METADATA ===== */
  getCategoriesForSelect(): Promise<any[]>;
  searchCategoriesByName(search: string): Promise<any[]>;
  getBrands(search?: string): Promise<any[]>;
}
