import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketplaceProductsBulkController } from 'src/app/controller/madre/products-sync/MarketplaceProductsBulk.Controller';
import { ProductSyncRunsController } from 'src/app/controller/madre/products-sync/ProductSyncRuns.Controller';
import { SkuPauseFlagsController } from 'src/app/controller/madre/products-sync/SkuPauseFlags.Controller';

import { SQLProductSyncRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRepository';
import { SQLProductSyncRunRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRunRepository';
import { SQLSkuPauseFlagRepository } from 'src/app/driver/repositories/madre/product-sync/SQLSkuPauseFlagRepository';

import { ProductSyncUpdateService } from 'src/app/services/madre/product-sync/ProductSyncUpdateService';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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

  controllers: [MarketplaceProductsBulkController, ProductSyncRunsController, SkuPauseFlagsController],

  providers: [
    // =====================
    // REPOSITORIES
    // =====================
    SQLProductSyncRepository,
    SQLProductSyncRunRepository,
    SQLSkuPauseFlagRepository,

    // =====================
    // SERVICES
    // =====================
    ProductSyncUpdateService,

    // =====================
    // TOKENS
    // =====================
    {
      provide: 'IProductSyncRepository',
      useClass: SQLProductSyncRepository
    },
    {
      provide: 'IProductSyncRunRepository',
      useClass: SQLProductSyncRunRepository
    },
    {
      provide: 'ISkuPauseFlagRepository',
      useClass: SQLSkuPauseFlagRepository
    }
  ],

  exports: ['IProductSyncRepository', 'ISkuPauseFlagRepository', ProductSyncUpdateService]
})
export class ProductSyncModule {}
