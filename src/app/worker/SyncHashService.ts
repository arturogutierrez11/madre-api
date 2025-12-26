import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis from 'ioredis';
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
export class SyncHashService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);
    const username = process.env.REDIS_USERNAME;
    const password = process.env.REDIS_PASSWORD;

    if (!host || !port) {
      throw new Error(
        '[SyncHashService] Missing REDIS_HOST/REDIS_PORT. Cannot initialize Redis client.'
      );
    }

    // DigitalOcean Managed Redis requires TLS
    this.redis = new Redis({
      host,
      port,
      username,
      password,
      tls: {},
      maxRetriesPerRequest: 3
    });

    this.redis.on('error', err => {
      console.error('[SyncHashService] Redis error:', err?.message ?? err);
    });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      // Best-effort shutdown
      this.redis.disconnect();
    }
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
    if (skus.length === 0) {
      return new Map();
    }

    const values = await this.redis.hmget(REDIS_HASH_KEY, ...skus);
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
    if (hashMap.size === 0) {
      return;
    }

    const entries: string[] = [];
    hashMap.forEach((hash, sku) => {
      entries.push(sku, hash);
    });

    // ioredis supports variadic HSET: (key, field1, value1, field2, value2, ...)
    await this.redis.hset(REDIS_HASH_KEY, ...entries);
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
    // SET key value NX EX ttl - only set if not exists
    const result = await this.redis.set(
      SYNC_LOCK_KEY,
      Date.now().toString(),
      'EX',
      LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  /**
   * Release the sync lock
   */
  async releaseLock(): Promise<void> {
    await this.redis.del(SYNC_LOCK_KEY);
  }
}

