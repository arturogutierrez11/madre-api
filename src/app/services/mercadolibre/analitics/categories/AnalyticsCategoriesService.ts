import { Inject, Injectable } from '@nestjs/common';
import { IAnalyticsCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/categories/IAnalyticsCategoriesRepository';
import { ISQLMercadoLibreCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/categories/ISQLMercadoLibreCategoriesRepository';
import { buildCacheKey } from 'src/app/driver/repositories/mercadolibre/analitics/categories/helper/buildCacheKey';
import { ISQLAnalyticsCacheCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/categories/ISQLAnalyticsCacheCategoriesRepository';

@Injectable()
export class AnalyticsCategoriesService {
  private readonly SELLER_ID = '1757836744';

  constructor(
    @Inject('IAnalyticsCategoriesRepository')
    private readonly repository: IAnalyticsCategoriesRepository,

    @Inject('ISQLMercadoLibreCategoriesRepository')
    private readonly categoriesRepository: ISQLMercadoLibreCategoriesRepository,

    @Inject('ISQLAnalyticsCacheCategoriesRepository')
    private readonly cacheRepository: ISQLAnalyticsCacheCategoriesRepository
  ) {}

  /* ===================================================== */
  /* INTERNAL CACHE EXECUTOR */
  /* ===================================================== */

  private async executeWithCache<T>(prefix: string, params: any, callback: () => Promise<T>): Promise<T> {
    const version = await this.cacheRepository.getCurrentVersion();

    const cacheKey = buildCacheKey(prefix, {
      sellerId: this.SELLER_ID,
      ...params
    });

    const cached = await this.cacheRepository.getByKey<T>(cacheKey, version);

    if (cached) {
      return cached;
    }

    const result = await callback();

    await this.cacheRepository.save(cacheKey, version, result);

    return result;
  }

  /* ===================================================== */
  /* CATEGORIES PERFORMANCE */
  /* ===================================================== */

  async getCategoriesPerformance(params: {
    categoryId?: string;
    orderBy?: 'visits' | 'orders' | 'conversion' | 'revenue';
    direction?: 'asc' | 'desc';
  }) {
    const { categoryId, orderBy = 'visits', direction = 'desc' } = params;

    const allowedOrderBy = ['visits', 'orders', 'conversion', 'revenue'];
    const safeOrderBy = allowedOrderBy.includes(orderBy ?? '') ? orderBy : 'visits';
    const safeDirection = direction === 'asc' ? 'asc' : 'desc';

    let categoryIds: string[] | undefined;

    if (categoryId) {
      const subtree = await this.categoriesRepository.findSubTree(categoryId);
      categoryIds = subtree.map(c => c.id).sort(); // importante para cache estable
    }

    return this.executeWithCache(
      'categoriesPerformance',
      { categoryIds, orderBy: safeOrderBy, direction: safeDirection },
      () =>
        this.repository.getCategoriesPerformance({
          sellerId: this.SELLER_ID,
          categoryIds,
          orderBy: safeOrderBy,
          direction: safeDirection
        })
    );
  }

  /* ===================================================== */
  /* PARENT PERFORMANCE */
  /* ===================================================== */

  async getParentCategoriesPerformance(params?: {
    orderBy?: 'visits' | 'orders' | 'revenue';
    direction?: 'asc' | 'desc';
  }) {
    const { orderBy = 'visits', direction = 'desc' } = params ?? {};

    const allowedOrderBy = ['visits', 'orders', 'revenue'];
    const safeOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'visits';
    const safeDirection = direction === 'asc' ? 'asc' : 'desc';

    return this.executeWithCache(
      'parentCategoriesPerformance',
      { orderBy: safeOrderBy, direction: safeDirection },
      () =>
        this.repository.getParentCategoriesPerformance({
          sellerId: this.SELLER_ID,
          orderBy: safeOrderBy,
          direction: safeDirection
        })
    );
  }

  /* ===================================================== */
  /* AVAILABLE CATEGORIES (NO CACHE - LIVIANA) */
  /* ===================================================== */

  async getAvailableCategories() {
    return this.repository.getAvailableCategories();
  }

  /* ===================================================== */
  /* CHILDREN PERFORMANCE */
  /* ===================================================== */

  async getChildrenPerformance(parentId?: string) {
    return this.executeWithCache('childrenPerformance', { parentId: parentId ?? null }, () =>
      this.repository.getChildrenPerformance({
        sellerId: this.SELLER_ID,
        parentId: parentId ?? null
      })
    );
  }

  /* ===================================================== */
  /* CATEGORY PRODUCTS (CACHE POR COMBINACIÓN EXACTA) */
  /* ===================================================== */

  async getCategoryProducts(
    categoryId: string,
    page = 1,
    limit = 20,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      minVisits?: number;
      maxVisits?: number;
      minOrders?: number;
      maxOrders?: number;
      minRevenue?: number;
      maxRevenue?: number;
      excludeMarketplace?: string[];
    }
  ) {
    const normalizedFilters = {
      ...filters,
      excludeMarketplace: filters?.excludeMarketplace?.slice().sort()
    };

    return this.executeWithCache(
      'categoryProducts',
      {
        categoryId,
        page,
        limit,
        ...normalizedFilters
      },
      () =>
        this.repository.getCategoryProducts({
          categoryId,
          page,
          limit,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          minVisits: filters?.minVisits,
          maxVisits: filters?.maxVisits,
          minOrders: filters?.minOrders,
          maxOrders: filters?.maxOrders,
          minRevenue: filters?.minRevenue,
          maxRevenue: filters?.maxRevenue,
          excludeMarketplace: filters?.excludeMarketplace
        })
    );
  }

  async invalidateAnalyticsCache(): Promise<{ success: boolean }> {
    await this.cacheRepository.incrementVersion();

    return {
      success: true
    };
  }
}
