import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheManager } from 'src/core/adapters/cache/ICacheManager';

const CACHE_TTL_MILLI_SECONDS = 5 * 60 * 60 * 1000; // 5 hours (18000000 milisegundos)

@Injectable()
export class CacheManager implements ICacheManager {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async save(key: string, data: unknown, cacheTtlSeconds: number = CACHE_TTL_MILLI_SECONDS): Promise<void> {
    await this.cacheManager.set(key, data, cacheTtlSeconds);
  }
}
