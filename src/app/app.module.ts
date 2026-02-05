import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './module/madre/products/Products.Module';
import { BrandsModule } from './module/madre/brands/Brands.Module';
import { CategoriesModule } from './module/madre/categories/Categories.Module';
import { AutomeliSyncWorkerModule } from './module/madre/sync/AutomeliSyncWorker.module';
import { ProductSyncModule } from './module/madre/product-sync/ProductSync.Module';
import { TokenModule } from './module/mercadolibre/tokens/Token.Module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProductModule,
    BrandsModule,
    CategoriesModule,
    AutomeliSyncWorkerModule,
    ProductSyncModule,
    TokenModule
  ]
})
export class AppModule {}
