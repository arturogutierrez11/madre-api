import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketplaceProductsBulkController } from 'src/app/controller/madre/products-sync/MarketplaceProductsBulk.Controller';
import { ProductSyncRunsController } from 'src/app/controller/madre/products-sync/ProductSyncRuns.Controller';
import { SQLProductSyncRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRepository';
import { SQLProductSyncRunRepository } from 'src/app/driver/repositories/madre/product-sync/SQLProductSyncRunRepository';
import { IProductSyncRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRepository';

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
  controllers: [MarketplaceProductsBulkController, ProductSyncRunsController],
  providers: [
    SQLProductSyncRepository,
    {
      provide: 'IProductSyncRepository',
      useClass: SQLProductSyncRepository
    },
    {
      provide: 'IProductSyncRunRepository',
      useClass: SQLProductSyncRunRepository
    }
  ],
  exports: ['IProductSyncRepository']
})
export class ProductSyncModule {}
