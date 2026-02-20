export interface IAnalyticsCategoriesRepository {
  getCategoriesPerformance(params: {
    sellerId: string;
    categoryIds?: string[];
    orderBy?: 'visits' | 'orders' | 'conversion' | 'revenue';
    direction?: 'asc' | 'desc';
  }): Promise<
    {
      categoryId: string;
      visits: number;
      orders: number;
      revenue: number;
      avgTicket: number;
      conversionRate: number;
    }[]
  >;

  getAvailableCategories(): Promise<
    {
      id: string;
      name: string;
    }[]
  >;

  getParentCategoriesPerformance(params: {
    sellerId: string;
    orderBy?: 'visits' | 'orders' | 'revenue';
    direction?: 'asc' | 'desc';
  }): Promise<
    {
      categoryId: string;
      categoryName: string;
      visits: number;
      orders: number;
      revenue: number;
    }[]
  >;

  getChildrenPerformance(params: { sellerId: string; parentId: string | null });

  getCategoryProducts(params: {
    sellerId: string;
    categoryId: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    minVisits?: number;
    maxVisits?: number;
    minOrders?: number;
    maxOrders?: number;
    minRevenue?: number;
    maxRevenue?: number;
  });
  addFavorite(productId: string, sellerSku: string);
  removeFavorite(productId: string);
  getFavoriteProductsAnalytics();
  bulkAddFavorites(filters: {
    categoryId?: string;
    brand?: string;
    minRevenue?: number;
    minVisits?: number;
    minOrders?: number;
    minPrice?: number;
    maxPrice?: number;
  });
}
