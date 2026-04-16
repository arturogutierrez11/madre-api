import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDeltaController } from 'src/app/controller/internal/product-delta/ProductDelta.Controller';
import { SQLProductDeltaRepository } from 'src/app/driver/repositories/madre/delta/SQLProductDeltaRepository';
import { ProductDeltaService } from 'src/app/services/madre/delta/ProductDeltaService';

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
  controllers: [ProductDeltaController],
  providers: [ProductDeltaService, { provide: 'IProductDeltaRepository', useClass: SQLProductDeltaRepository }]
})
export class ProductDeltaModule {}
