import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsBrandsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsBrandsRepository';
import { IAnalyticsProductsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsProductsRepository';

@Injectable()
export class GetAnalyticsBrands {
  constructor(
    @Inject('IAnalyticsBrandsRepository')
    private readonly brandsRepository: IAnalyticsBrandsRepository,

    @Inject('IAnalyticsProductsRepository')
    private readonly productsRepository: IAnalyticsProductsRepository
  ) {}

  // 🔵 Listado de marcas con métricas
  async getBrands(params: Parameters<IAnalyticsBrandsRepository['getBrands']>[0]) {
    return this.brandsRepository.getBrands(params);
  }

  // 🔵 Listado simple de todas las marcas (paginado)
  async getAllBrands(params: { page?: number; limit?: number }) {
    return this.brandsRepository.getBrandsListPaginated(params);
  }
}
