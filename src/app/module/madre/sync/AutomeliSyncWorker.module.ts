import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisClientModule } from '../../RedisClient.module';

import { AutomeliSyncController } from 'src/app/controller/madre/sync/AutomeliSyncCron.Controller';

import { SyncMadreDbFromAutomeli } from 'src/core/interactors/madre/SyncMadreDbFromAutomeli';
import { AutomeliProductsState } from 'src/core/interactors/madre/AutomeliProductsState';
import { ProductStateHasher } from 'src/core/interactors/madre/ProductStateHasher';

import { SQLProductMadreRepository } from 'src/app/driver/repositories/madre/products/SQLProductMadreRepository';
import { AutomeliProductsRepository } from 'src/core/drivers/repositories/automeli/products/AutomeliProductsRepository';
import { AutomeliProductsStateRedisCache } from 'src/app/driver/cache/redis/AutomeliProductsStateRedisCache';
import { RedisSyncLock } from 'src/app/driver/locks/redis/RedisSyncLock';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    RedisClientModule,
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
  controllers: [AutomeliSyncController],
  providers: [
    // ─── Interactor & collaborators ─────────────────────
    SyncMadreDbFromAutomeli,
    AutomeliProductsState,
    ProductStateHasher,

    {
      provide: 'AUTOMELI_SELLER_ID',
      useValue: process.env.AUTOMELI_SELLER_ID ?? '1757836744'
    },

    // ─── Adapters ───────────────────────────────────────
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
    }
  ],
  exports: [
    SyncMadreDbFromAutomeli // ⬅️ CLAVE
  ]
})
export class AutomeliSyncWorkerModule {}
