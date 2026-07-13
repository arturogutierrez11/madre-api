import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import { CacheManager } from '../driver/cache/CacheManager';
import { RedisClientModule } from './RedisClient.module';
import Redis from 'ioredis';

const CACHE_TTL_SECONDS = 5 * 60 * 60; // 5 hours

@Global()
@Module({
  providers: [CacheManager],
  imports: [
    RedisClientModule,
    NestCacheModule.registerAsync({
      imports: [RedisClientModule],
      useFactory: async (redisClient: Redis) => ({
        store: redisInsStore(redisClient, {
          ttl: CACHE_TTL_SECONDS,
          max: 1000000,
        }),
      }),
      inject: ['REDIS_CLIENT']
    })
  ],
  exports: [NestCacheModule, CacheManager]
})
export class CacheModule {}
