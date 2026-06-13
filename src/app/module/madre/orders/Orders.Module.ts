import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from 'src/app/controller/madre/orders/Orders.Controller';
import { SQLOrdersRepository } from 'src/app/driver/repositories/madre/orders/SQLOrdersRepository';
import { OrdersService } from 'src/app/services/madre/orders/OrdersService';

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
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: 'ISQLOrdersRepository',
      useClass: SQLOrdersRepository
    }
  ],
  exports: [OrdersService]
})
export class OrdersModule {}
