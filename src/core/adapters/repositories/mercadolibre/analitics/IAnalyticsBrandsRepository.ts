export interface IAnalyticsBrandsRepository {
  getBrands(params: {
    page?: number;
    limit?: number;
    orderBy?: 'orders' | 'visits' | 'products';
    direction?: 'asc' | 'desc';
  }): Promise<{
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    items: {
      brand: string;
      totalProducts: number;
      totalOrders: number;
      totalVisits: number;
    }[];
  }>;
}
