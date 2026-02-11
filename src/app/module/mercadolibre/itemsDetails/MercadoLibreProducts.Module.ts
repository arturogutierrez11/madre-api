import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoLibreProductsController } from 'src/app/controller/mercadolibre/itemsDetails/MercadoLibreProducts.Controller';
import { SQLMercadoLibreProductsRepository } from 'src/app/driver/repositories/mercadolibre/itemsDetails/SQLMercadoLibreProductsRepository';
import { MercadoLibreProductsService } from 'src/app/services/mercadolibre/itemsDetails/MercadoLibreProductsService';

@Module({
  imports: [
    TypeOrmModule.forFeature([]) // usamos EntityManager, no entidad
  ],
  controllers: [MercadoLibreProductsController],
  providers: [
    MercadoLibreProductsService,
    {
      provide: 'ISQLMercadoLibreProductsRepository',
      useClass: SQLMercadoLibreProductsRepository
    }
  ],
  exports: [MercadoLibreProductsService]
})
export class MercadoLibreProductsModule {}
