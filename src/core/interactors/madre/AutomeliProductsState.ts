import { Inject, Injectable } from '@nestjs/common';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';
import { IAutomeliProductsStateCache } from 'src/core/adapters/cache/IAutomeliProductsStateCache';
import { ProductStateHasher } from './ProductStateHasher';

export interface ProductHashData {
  sku: string;
  hash: string;
  product: AutomeliProduct;
}

@Injectable()
export class AutomeliProductsState {
  constructor(
    private readonly hasher: ProductStateHasher,
    @Inject('IAutomeliProductsStateCache')
    private readonly cache: IAutomeliProductsStateCache
  ) {}

  async filterChangedProducts(products: AutomeliProduct[]): Promise<ProductHashData[]> {
    if (products.length === 0) return [];

    const productHashes: ProductHashData[] = products.map(product => ({
      sku: product.sku,
      hash: this.hasher.computeHash(product),
      product
    }));

    const skus = productHashes.map(p => p.sku);
    const existing = await this.cache.getHashes(skus);

    return productHashes.filter(({ sku, hash }) => existing.get(sku) !== hash);
  }

  async updateHashes(products: ProductHashData[]): Promise<void> {
    if (products.length === 0) return;

    const map = new Map<string, string>();
    for (const p of products) map.set(p.sku, p.hash);
    await this.cache.setHashes(map);
  }
}
