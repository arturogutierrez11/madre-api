import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './module/madre/products/Products.Module';
import { BrandsModule } from './module/madre/brands/Brands.Module';
import { CategoriesModule } from './module/madre/categories/Categories.Module';
import { ProductSyncModule } from './module/madre/product-sync/ProductSync.Module';
import { TokenModule } from './module/mercadolibre/tokens/Token.Module';
import { MercadoLibreItemsModule } from './module/mercadolibre/itemsId/MercadoLibreItems.Module';
import { SyncStatesModule } from './module/mercadolibre/sync/SyncStates.module';
import { MercadoLibreProductsModule } from './module/mercadolibre/itemsDetails/MercadoLibreProducts.Module';
import { MercadoLibreVisitsModule } from './module/mercadolibre/itemsVisits/MercadoLibreVisits.Module';
import { MercadoLibreCategoriesModule } from './module/mercadolibre/categories/MercadoLibreCategories.Module';
import { AnalyticsCategoriesModule } from './module/mercadolibre/analitics/AnalyticsCategories.Module';
import { AnalyticsModule } from './module/mercadolibre/analitics/AnalyticsProducts.Module';
import { AnalyticsBrandsModule } from './module/mercadolibre/analitics/AnalyticsBrands.Module';
import { MarketplaceFavoritesModule } from './module/mercadolibre/analitics/AnalitycsFavorites.Module';
import { PublicationRunsModule } from './module/madre/publisher/publication_Run/PublicationRuns.Module';
import { PublicationJobsModule } from './module/madre/publisher/publication_Jobs/PublicationJobs.Module';
import { BrandMatchModule } from './module/madre/brands/fravegaBrandMatch/BrandMatch.Module';
import { MegatoneBrandMatchModule } from './module/madre/brands/megatoneBrandMatch/MegatoneBrandMatch.Module';
import { MeliProductsImportWorkerModule } from './module/madre/sync/MeliProductsImportWorker.module';
import { InternalAuthModule } from './module/auth/InternalAuth.Module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProductModule,
    BrandsModule,
    CategoriesModule,
    ProductSyncModule,
    TokenModule,
    MercadoLibreItemsModule,
    SyncStatesModule,
    MercadoLibreProductsModule,
    MercadoLibreVisitsModule,
    MercadoLibreCategoriesModule,
    AnalyticsCategoriesModule,
    AnalyticsModule,
    AnalyticsBrandsModule,
    MarketplaceFavoritesModule,
    BrandMatchModule,
    MegatoneBrandMatchModule,
    InternalAuthModule,

    MeliProductsImportWorkerModule,

    // PUBLCIADOR:
    // modulo de la tabla de publication_run
    PublicationRunsModule,
    PublicationJobsModule
  ]
})
export class AppModule {}
