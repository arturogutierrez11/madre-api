import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { IAutomeliProductsStateCache } from 'src/core/adapters/cache/IAutomeliProductsStateCache';

const REDIS_HASH_KEY = 'automeli_products_state';
const HSET_CHUNK_FIELDS = 5000; // avoid huge argument lists

@Injectable()
export class AutomeliProductsStateRedisCache implements IAutomeliProductsStateCache, OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {}

  async getHashes(skus: string[]): Promise<Map<string, string | null>> {
    if (skus.length === 0) return new Map();

    const values = await this.redis.hmget(REDIS_HASH_KEY, ...skus);
    const result = new Map<string, string | null>();
    skus.forEach((sku, idx) => result.set(sku, values[idx]));
    return result;
  }

  async setHashes(hashMap: Map<string, string>): Promise<void> {
    if (hashMap.size === 0) return;

    const entries: string[] = [];
    hashMap.forEach((hash, sku) => entries.push(sku, hash));

    // entries are [field, value, field, value...]
    for (let i = 0; i < entries.length; i += HSET_CHUNK_FIELDS * 2) {
      const chunk = entries.slice(i, i + HSET_CHUNK_FIELDS * 2);
      await this.redis.hset(REDIS_HASH_KEY, ...chunk);
    }
  }
}


