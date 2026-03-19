import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisClientModule } from '../../RedisClient.module';

import { SyncMadreDbFromMeliProductsDb } from 'src/core/interactors/madre/SyncMadreDbFromMeliProductsDb';
import { MeliProductsImportState } from 'src/core/interactors/madre/MeliProductsImportState';
import { MeliProductImportHasher } from 'src/core/interactors/madre/MeliProductImportHasher';

import { SQLProductMadreRepository } from 'src/app/driver/repositories/madre/products/SQLProductMadreRepository';
import { SQLMercadoLibreProductsRepository } from 'src/app/driver/repositories/mercadolibre/itemsDetails/SQLMercadoLibreProductsRepository';
import { MeliProductsImportStateRedisCache } from 'src/app/driver/cache/redis/MeliProductsImportStateRedisCache';
import { MeliProductsImportSyncLock } from 'src/app/driver/locks/redis/MeliProductsImportSyncLock';
import { MercadoLibreApiClient } from 'src/app/driver/mercadolibre/api/MercadoLibreApiClient';
import { MeliTokenService } from 'src/app/services/mercadolibre/token/MeliTokenService';
import { SQLMeliTokenRepository } from 'src/app/driver/repositories/mercadolibre/tokens/SQLMeliTokenRepository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  providers: [
    SyncMadreDbFromMeliProductsDb,
    MeliProductsImportState,
    MeliProductImportHasher,
    MeliTokenService,

    {
      provide: 'IProductsRepository',
      useClass: SQLProductMadreRepository
    },
    {
      provide: 'ISQLMercadoLibreProductsRepository',
      useClass: SQLMercadoLibreProductsRepository
    },
    {
      provide: 'IMeliProductsImportStateCache',
      useClass: MeliProductsImportStateRedisCache
    },
    {
      provide: 'IMeliProductsImportSyncLock',
      useClass: MeliProductsImportSyncLock
    },
    {
      provide: 'IMercadoLibreApiClient',
      useClass: MercadoLibreApiClient
    },
    {
      provide: 'ISQLMeliTokenRepository',
      useClass: SQLMeliTokenRepository
    }
  ],
  exports: [SyncMadreDbFromMeliProductsDb]
})
export class MeliProductsImportWorkerModule {}
