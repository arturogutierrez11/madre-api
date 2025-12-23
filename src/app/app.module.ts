import { Module } from '@nestjs/common';
import { ProductModule } from './module/madre/products/Products.Module';

@Module({
  imports: [ProductModule]
})
export class AppModule {}
