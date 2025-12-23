import { ICacheManager } from 'src/core/adapters/cache/ICacheManager';
import { IAutomeliProductsRepository } from 'src/core/adapters/repositories/automeli/products/IAutomeliProductsRepository';
import { IProductsRepository } from 'src/core/adapters/repositories/madre/products/IProductsRepository';

interface UpdateMadreFromAutomeliBuilder {
  productsRepository: IProductsRepository;
  automeliProductsRepository: IAutomeliProductsRepository;
  cachemanager: ICacheManager;
}
export class UpdateMadreFromAutomeli {
  private readonly productsRepository: IProductsRepository;
  private readonly automeliProductsRepository: IAutomeliProductsRepository;
  private readonly cacheManager: ICacheManager;

  constructor(builder: UpdateMadreFromAutomeliBuilder) {
    this.productsRepository = builder.productsRepository;
    this.automeliProductsRepository = builder.automeliProductsRepository;
    this.cacheManager = builder.cachemanager;
  }

  async processUpdateMadre() {}
}
