import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoLibreOrdersController } from 'src/app/controller/mercadolibre/orders/MercadoLibreOrders.Controller';
import { SQLMercadoLibreOrdersRepository } from 'src/app/driver/repositories/mercadolibre/orders/SQLMercadoLibreOrdersRepository';
import { MercadoLibreOrdersService } from 'src/app/services/mercadolibre/orders/MercadoLibreOrdersService';

@Module({
  imports: [
    TypeOrmModule.forFeature([])
  ],
  controllers: [MercadoLibreOrdersController],
  providers: [
    MercadoLibreOrdersService,
    {
      provide: 'ISQLMercadoLibreOrdersRepository',
      useClass: SQLMercadoLibreOrdersRepository
    }
  ],
  exports: [MercadoLibreOrdersService]
})
export class MercadoLibreOrdersModule {}
