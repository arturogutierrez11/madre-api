import { Module } from '@nestjs/common';
import { ProductModule } from './module/madre/products/Products.Module';
import { BrandsModule } from './module/madre/brands/Brands.Module';
import { CategoriesModule } from './module/madre/categories/Categories.Module';

@Module({
  imports: [ProductModule, BrandsModule, CategoriesModule]
})
export class AppModule {}
