import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsProductsDto } from 'src/app/controller/mercadolibre/analitics/dto/products/GetAnalyticsProductsDto';
import { IAnalyticsProductsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsProductsRepository';

@Injectable()
export class AnalyticsProductsService {
  constructor(
    @Inject('IAnalyticsProductsRepository')
    private readonly repository: IAnalyticsProductsRepository
  ) {}

  /* ================= OVERVIEW ================= */

  async getOverview(params: GetAnalyticsProductsDto) {
    return this.repository.getProductsOverview(params);
  }

  /* ================= FAVORITOS SIMPLE ================= */

  async saveSelection(marketplaceId: number, filters: GetAnalyticsProductsDto) {
    return this.repository.saveSelectionToFolder(marketplaceId, filters);
  }

  /* ================= SEGMENTOS ================= */

  async saveSelectionAsSegment(marketplaceId: number, filters: GetAnalyticsProductsDto) {
    return this.repository.saveSelectionAsSegment(marketplaceId, filters);
  }

  /* ================= METADATA ================= */

  async getCategories() {
    return this.repository.getCategoriesForSelect();
  }

  async searchCategories(search: string) {
    return this.repository.searchCategoriesByName(search);
  }

  async getBrands(search?: string) {
    return this.repository.getBrands(search);
  }
}
