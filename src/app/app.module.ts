import { Module } from '@nestjs/common';
import { ProductsModule } from './module/madre/Products.Module';

@Module({
  imports: [ProductsModule]
})
export class AppModule {}
