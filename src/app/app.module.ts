import { Module } from '@nestjs/common';
import { ProductModule } from './module/madre/products/Products.Module';
import { BrandsModule } from './module/madre/brands/Brands.Module';
import { CategoriesModule } from './module/madre/categories/Categories.Module';
import { AutomeliSyncWorkerModule } from './module/madre/sync/AutomeliSyncWorker.module';

@Module({
  imports: [ProductModule, BrandsModule, CategoriesModule, AutomeliSyncWorkerModule]
})
export class AppModule {}
