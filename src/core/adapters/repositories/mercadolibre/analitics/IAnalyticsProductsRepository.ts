export interface IAnalyticsProductsRepository {
  getProducts(params: {
    page?: number;
    limit?: number;

    brand?: string;

    minPrice?: number;
    maxPrice?: number;

    minVisits?: number;
    maxVisits?: number;

    minOrders?: number;
    maxOrders?: number;

    orderBy?: 'visits' | 'orders' | 'price';
    direction?: 'asc' | 'desc';

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
      price: number;
      soldQuantity: number;
      visits: number;
      seller_sku: string;

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
