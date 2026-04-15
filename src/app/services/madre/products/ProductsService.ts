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

  async listAll(
    pagination: PaginationParams,
    filters?: {
      sku?: string;
    }
  ): Promise<PaginatedResult<ProductMadre>> {
    return this.productRepository.findAll(pagination, filters);
  }

  async getStatusSnapshotsBySkus(skus: string[]) {
    const normalizedSkus = [...new Set(
      (skus ?? [])
        .map(sku => String(sku ?? '').trim().toUpperCase())
        .filter(Boolean)
    )];

    if (!normalizedSkus.length) {
      return {
        items: [],
        total: 0
      };
    }

    const items = await this.productRepository.findStatusSnapshotsBySkus(normalizedSkus);

    return {
      items,
      total: items.length
    };
  }
}
