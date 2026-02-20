import { Inject, Injectable } from '@nestjs/common';
import { IAnalyticsCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsCategoriesRepository';

import { ISQLMercadoLibreCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/categories/ISQLMercadoLibreCategoriesRepository';

@Injectable()
export class AnalyticsCategoriesService {
  private readonly SELLER_ID = '1757836744';

  constructor(
    @Inject('IAnalyticsCategoriesRepository')
    private readonly repository: IAnalyticsCategoriesRepository,

    @Inject('ISQLMercadoLibreCategoriesRepository')
    private readonly categoriesRepository: ISQLMercadoLibreCategoriesRepository
  ) {}

  async getCategoriesPerformance(params: {
    categoryId?: string;
    orderBy?: 'visits' | 'orders' | 'conversion' | 'revenue';
    direction?: 'asc' | 'desc';
  }) {
    const { categoryId, orderBy = 'visits', direction = 'desc' } = params;

    const allowedOrderBy = ['visits', 'orders', 'conversion', 'revenue'];
    const safeOrderBy = allowedOrderBy.includes(orderBy ?? '') ? orderBy : 'visits';
    const safeDirection = direction === 'asc' ? 'asc' : 'desc';

    let categoryIds: string[] | undefined = undefined;

    if (categoryId) {
      const subtree = await this.categoriesRepository.findSubTree(categoryId);

      categoryIds = subtree.map(c => c.id);
    }

    return this.repository.getCategoriesPerformance({
      sellerId: this.SELLER_ID,
      categoryIds,
      orderBy: safeOrderBy,
      direction: safeDirection
    });
  }

  // ─────────────────────────────────────────────
  // PARENT CATEGORIES PERFORMANCE (Executive)
  // ─────────────────────────────────────────────
  async getParentCategoriesPerformance(params?: {
    orderBy?: 'visits' | 'orders' | 'revenue';
    direction?: 'asc' | 'desc';
  }) {
    const { orderBy = 'visits', direction = 'desc' } = params ?? {};

    const allowedOrderBy = ['visits', 'orders', 'revenue'];
    const safeOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'visits';

    const safeDirection = direction === 'asc' ? 'asc' : 'desc';

    return this.repository.getParentCategoriesPerformance({
      sellerId: this.SELLER_ID,
      orderBy: safeOrderBy,
      direction: safeDirection
    });
  }

  async getAvailableCategories() {
    return this.repository.getAvailableCategories();
  }

  // ─────────────────────────────────────────────
  // GET CHILDREN PERFORMANCE
  // ─────────────────────────────────────────────
  async getChildrenPerformance(parentId?: string) {
    return this.repository.getChildrenPerformance({
      sellerId: this.SELLER_ID,
      parentId: parentId ?? null
    });
  }

  async getCategoryProducts(categoryId: string) {
    return this.repository.getCategoryProducts({
      sellerId: '1757836744', // después lo hacemos dinámico
      categoryId
    });
  }
}
