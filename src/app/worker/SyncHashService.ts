import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

const REDIS_HASH_KEY = 'automeli_products_state';
const SYNC_LOCK_KEY = 'automeli_sync:running';
const LOCK_TTL_SECONDS = 4 * 60 * 60; // 4 hours max

export interface ProductHashData {
  sku: string;
  hash: string;
  product: AutomeliProduct;
}

@Injectable()
export class SyncHashService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Get the underlying Redis client from cache-manager
   */
  private getRedisClient(): any {
    const store = (this.cacheManager as any).store;
    return store?.client || store?.getClient?.();
  }

  /**
   * Compute MD5 hash for a product based on sync-relevant fields
   */
  computeHash(product: AutomeliProduct): string {
    const hashString = [
      product.sku,
      product.meliSalePrice,
      product.stockQuantity,
      product.meliStatus,
      product.manufacturingTime ?? ''
    ].join('|');

    return createHash('md5').update(hashString).digest('hex');
  }

  /**
   * Get multiple hashes from Redis using HMGET
   */
  async getHashes(skus: string[]): Promise<Map<string, string | null>> {
    const client = this.getRedisClient();
    if (!client || skus.length === 0) {
      return new Map();
    }

    const values = await client.hmget(REDIS_HASH_KEY, ...skus);
    const result = new Map<string, string | null>();

    skus.forEach((sku, index) => {
      result.set(sku, values[index]);
    });

    return result;
  }

  /**
   * Set multiple hashes in Redis using HMSET
   */
  async setHashes(hashMap: Map<string, string>): Promise<void> {
    const client = this.getRedisClient();
    if (!client || hashMap.size === 0) {
      return;
    }

    const entries: string[] = [];
    hashMap.forEach((hash, sku) => {
      entries.push(sku, hash);
    });

    await client.hmset(REDIS_HASH_KEY, ...entries);
  }

  /**
   * Compare products with stored hashes and return only changed ones
   */
  async filterChangedProducts(products: AutomeliProduct[]): Promise<ProductHashData[]> {
    if (products.length === 0) {
      return [];
    }

    // Compute hashes for all products
    const productHashes: ProductHashData[] = products.map(product => ({
      sku: product.sku,
      hash: this.computeHash(product),
      product
    }));

    // Get existing hashes from Redis
    const skus = productHashes.map(p => p.sku);
    const existingHashes = await this.getHashes(skus);

    // Filter to only changed products
    return productHashes.filter(({ sku, hash }) => {
      const existingHash = existingHashes.get(sku);
      return existingHash !== hash; // Changed or new
    });
  }

  /**
   * Update hashes in Redis for successfully updated products
   */
  async updateHashes(products: ProductHashData[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const hashMap = new Map<string, string>();
    products.forEach(({ sku, hash }) => {
      hashMap.set(sku, hash);
    });

    await this.setHashes(hashMap);
  }

  /**
   * Try to acquire the sync lock
   */
  async acquireLock(): Promise<boolean> {
    const client = this.getRedisClient();
    if (!client) {
      console.warn('Redis client not available, proceeding without lock');
      return true;
    }

    // SET key value NX EX ttl - only set if not exists
    const result = await client.set(SYNC_LOCK_KEY, Date.now().toString(), 'EX', LOCK_TTL_SECONDS, 'NX');
    return result === 'OK';
  }

  /**
   * Release the sync lock
   */
  async releaseLock(): Promise<void> {
    const client = this.getRedisClient();
    if (!client) {
      return;
    }

    await client.del(SYNC_LOCK_KEY);
  }
}

