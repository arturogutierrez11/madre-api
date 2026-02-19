import { Inject, Injectable } from '@nestjs/common';
import { IAnalyticsCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsCategoriesRepository';

@Injectable()
export class AnalyticsCategoriesService {
  private readonly SELLER_ID = '1757836744';

  constructor(
    @Inject('IAnalyticsCategoriesRepository')
    private readonly repository: IAnalyticsCategoriesRepository
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

    return this.repository.getCategoriesPerformance({
      sellerId: this.SELLER_ID,
      categoryId,
      orderBy: safeOrderBy,
      direction: safeDirection
    });
  }

  async getAvailableCategories() {
    return this.repository.getAvailableCategories();
  }
}
