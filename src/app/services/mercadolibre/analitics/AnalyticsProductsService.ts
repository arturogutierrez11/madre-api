import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsProductsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsProductsRepository';

@Injectable()
export class GetAnalyticsProducts {
  constructor(
    @Inject('IAnalyticsProductsRepository')
    private readonly repository: IAnalyticsProductsRepository
  ) {}

  async execute(params: Parameters<IAnalyticsProductsRepository['getProducts']>[0]) {
    return this.repository.getProducts(params);
  }
}
