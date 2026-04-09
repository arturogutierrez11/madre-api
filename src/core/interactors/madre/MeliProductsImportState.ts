import { Inject, Injectable } from '@nestjs/common';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';
import { IMeliProductsImportStateCache } from 'src/core/adapters/cache/IMeliProductsImportStateCache';
import { MeliProductImportHasher } from './MeliProductImportHasher';

export interface MeliProductHashData {
  sku: string;
  hash: string;
  product: MercadoLibreProduct;
}

@Injectable()
export class MeliProductsImportState {
  constructor(
    private readonly hasher: MeliProductImportHasher,
    @Inject('IMeliProductsImportStateCache')
    private readonly cache: IMeliProductsImportStateCache
  ) {}

  async filterChangedProducts(products: MercadoLibreProduct[]): Promise<MeliProductHashData[]> {
    if (products.length === 0) return [];

    const productHashes: MeliProductHashData[] = products
      .filter(p => p.sellerSku)
      .map(product => ({
        sku: product.sellerSku!,
        hash: this.hasher.computeHash(product),
        product
      }));

    const skus = productHashes.map(p => p.sku);
    const existing = await this.cache.getHashes(skus);

    return productHashes.filter(({ sku, hash }) => existing.get(sku) !== hash);
  }

  async updateHashes(products: MeliProductHashData[]): Promise<void> {
    if (products.length === 0) return;

    const map = new Map<string, string>();
    for (const p of products) map.set(p.sku, p.hash);
    await this.cache.setHashes(map);
  }
}
