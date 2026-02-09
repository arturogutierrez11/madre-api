import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoLibreItemsController } from 'src/app/controller/mercadolibre/itemsId/MercadoLibreItems.Controller';
import { SQLMercadoLibreItemsRepository } from 'src/app/driver/repositories/mercadolibre/itemsId/SQLMercadoLibreItemsRepository';
import { MercadoLibreItemsService } from 'src/app/services/mercadolibre/itemsId/MercadoLibreItemsService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [MercadoLibreItemsController],
  providers: [
    MercadoLibreItemsService,
    {
      provide: 'ISQLMercadoLibreItemsRepository',
      useClass: SQLMercadoLibreItemsRepository
    }
  ],
  exports: [MercadoLibreItemsService]
})
export class MercadoLibreItemsModule {}
