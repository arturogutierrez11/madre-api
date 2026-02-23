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
    excludeMarketplace?: string[];
  }): Promise<{
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    items: {
      id: string;
      title: string;
      thumbnail: string;
      seller_sku: string;
      price: number;
      soldQuantity: number;
      visits: number;
      revenue: number;
      isFavorite: boolean;
      isPublished: boolean;
      publishedMarketplaces: {
        marketplace: string;
        status: string;
        price: number;
        stock: number;
        isActive: number;
      }[];
    }[];
  }>;
}
