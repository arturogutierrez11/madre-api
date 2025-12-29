import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { AutomeliSyncCronService } from './AutomeliSyncCron.service';
import { SQLProductMadreRepository } from '../../driver/repositories/madre/products/SQLProductMadreRepository';
import { AutomeliProductsRepository } from 'src/core/drivers/repositories/automeli/products/AutomeliProductsRepository';
import { AutomeliProductsStateRedisCache } from '../../driver/cache/redis/AutomeliProductsStateRedisCache';
import { RedisSyncLock } from '../../driver/locks/redis/RedisSyncLock';
import { ProductStateHasher } from './ProductStateHasher';
import { AutomeliProductsStateService } from './AutomeliProductsState.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false,
      autoLoadEntities: false
    })
  ],
  providers: [
    AutomeliSyncCronService,
    AutomeliProductsStateService,
    ProductStateHasher,

    {
      provide: 'IProductsRepository',
      useClass: SQLProductMadreRepository
    },
    {
      provide: 'IAutomeliProductsRepository',
      useClass: AutomeliProductsRepository
    },
    {
      provide: 'IAutomeliProductsStateCache',
      useClass: AutomeliProductsStateRedisCache
    },
    {
      provide: 'ISyncLock',
      useClass: RedisSyncLock
    },

    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const host = process.env.REDIS_HOST;
        const port = Number(process.env.REDIS_PORT);
        const username = process.env.REDIS_USERNAME;
        const password = process.env.REDIS_PASSWORD;

        if (!host || !port) {
          throw new Error('[REDIS_CLIENT] Missing REDIS_HOST/REDIS_PORT.');
        }

        return new Redis({
          host,
          port,
          username,
          password,
          tls: {},
          maxRetriesPerRequest: 3
        });
      }
    }
  ]
})
export class AutomeliSyncWorkerModule {}


