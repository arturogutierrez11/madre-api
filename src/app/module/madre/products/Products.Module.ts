import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from 'src/app/controller/madre/products/Products.Controller';
import { SQLProductMadreRepository } from 'src/app/driver/repositories/madre/products/SQLProductMadreRepository';
import { ProductsService } from 'src/app/services/madre/products/ProductsService';

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
  controllers: [ProductsController],
  providers: [ProductsService, { provide: 'IProductsRepository', useClass: SQLProductMadreRepository }]
})
export class ProductModule {}
