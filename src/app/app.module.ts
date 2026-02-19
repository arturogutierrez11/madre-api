import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './module/madre/products/Products.Module';
import { BrandsModule } from './module/madre/brands/Brands.Module';
import { CategoriesModule } from './module/madre/categories/Categories.Module';
import { AutomeliSyncWorkerModule } from './module/madre/sync/AutomeliSyncWorker.module';
import { ProductSyncModule } from './module/madre/product-sync/ProductSync.Module';
import { TokenModule } from './module/mercadolibre/tokens/Token.Module';
import { MercadoLibreItemsModule } from './module/mercadolibre/itemsId/MercadoLibreItems.Module';
import { SyncStatesModule } from './module/mercadolibre/sync/SyncStates.module';
import { MercadoLibreProductsModule } from './module/mercadolibre/itemsDetails/MercadoLibreProducts.Module';
import { MercadoLibreVisitsModule } from './module/mercadolibre/itemsVisits/MercadoLibreVisits.Module';
import { MercadoLibreCategoriesModule } from './module/mercadolibre/categories/MercadoLibreCategories.Module';
import { AnalyticsCategoriesModule } from './module/mercadolibre/analitics/AnalyticsCategories.Module';

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
    TokenModule,
    MercadoLibreItemsModule,
    SyncStatesModule,
    MercadoLibreProductsModule,
    MercadoLibreVisitsModule,
    MercadoLibreCategoriesModule,
    AnalyticsCategoriesModule
  ]
})
export class AppModule {}
