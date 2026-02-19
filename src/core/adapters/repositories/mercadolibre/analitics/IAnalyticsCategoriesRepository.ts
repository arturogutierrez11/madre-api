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
}
