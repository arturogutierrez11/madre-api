import { Module } from '@nestjs/common';
import { ProductsController } from 'src/app/controller/madre/Products.Controller';

@Module({
  controllers: [ProductsController],
  providers: [],
  exports: []
})
export class ProductsModule {}
