import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheManager } from '../driver/cache/CacheManager';

const CACHE_TTL_SECONDS = 5 * 60 * 60; // 5 hours

@Global()
@Module({
  providers: [CacheManager],
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        ttl: CACHE_TTL_SECONDS,
        max: 1000000,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        tls: {} // ⬅️ obligatorio para DigitalOcean
      })
    })
  ],
  exports: [NestCacheModule, CacheManager]
})
export class CacheModule {}
