import { Inject, Injectable } from '@nestjs/common';
import { IProductsRepository } from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { ProductMadre } from 'src/core/entities/madre/products/ProductMadre';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('IProductsRepository')
    private readonly productRepository: IProductsRepository
  ) {}

  async listAll(pagination: PaginationParams): Promise<PaginatedResult<ProductMadre>> {
    return this.productRepository.findAll(pagination);
  }
}
