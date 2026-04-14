import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ISyncLock } from 'src/core/adapters/locks/ISyncLock';

const SYNC_LOCK_KEY = 'automeli_sync:running';
const LOCK_TTL_SECONDS = 4 * 60 * 60; // 4 hours max

@Injectable()
export class RedisSyncLock implements ISyncLock, OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {}

  async acquire(): Promise<boolean> {
    const result = await this.redis.set(
      SYNC_LOCK_KEY,
      Date.now().toString(),
      'EX',
      LOCK_TTL_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  async release(): Promise<void> {
    await this.redis.del(SYNC_LOCK_KEY);
  }
}
