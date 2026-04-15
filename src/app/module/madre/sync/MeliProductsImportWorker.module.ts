import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisClientModule } from '../../RedisClient.module';
import { MeliProductsImportCronController } from 'src/app/controller/madre/sync/MeliProductsImportCron.Controller';

import { SyncMadreDbFromMeliProductsDb } from 'src/core/interactors/madre/SyncMadreDbFromMeliProductsDb';
import { MeliProductsImportState } from 'src/core/interactors/madre/MeliProductsImportState';
import { MeliProductImportHasher } from 'src/core/interactors/madre/MeliProductImportHasher';

import { SQLProductMadreRepository } from 'src/app/driver/repositories/madre/products/SQLProductMadreRepository';
import { SQLMercadoLibreProductsRepository } from 'src/app/driver/repositories/mercadolibre/itemsDetails/SQLMercadoLibreProductsRepository';
import { MeliProductsImportStateRedisCache } from 'src/app/driver/cache/redis/MeliProductsImportStateRedisCache';
import { MeliProductsImportSyncLock } from 'src/app/driver/locks/redis/MeliProductsImportSyncLock';
import { MeliApiDescriptionRepository } from 'src/core/drivers/repositories/meliapi/description/MeliApiDescriptionRepository';
import { MeliApiCategoriesRepository } from 'src/core/drivers/repositories/meliapi/categories/MeliApiCategoriesRepository';

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
  controllers: [MeliProductsImportCronController],
  providers: [
    SyncMadreDbFromMeliProductsDb,
    MeliProductsImportState,
    MeliProductImportHasher,

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
      provide: 'IMeliApiDescriptionRepository',
      useClass: MeliApiDescriptionRepository
    },
    {
      provide: 'IMeliApiCategoriesRepository',
      useClass: MeliApiCategoriesRepository
    }
  ],
  exports: [SyncMadreDbFromMeliProductsDb]
})
export class MeliProductsImportWorkerModule {}
