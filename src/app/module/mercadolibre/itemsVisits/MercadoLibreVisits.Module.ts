import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoLibreItemVisitsController } from 'src/app/controller/mercadolibre/itemsVisits/MercadoLibreItemVisits.Controller';
import { SQLMercadoLibreItemVisitsRepository } from 'src/app/driver/repositories/mercadolibre/itemsVisits/SQLMercadoLibreItemVisitsRepository';
import { MercadoLibreItemVisitsService } from 'src/app/services/mercadolibre/itemsVisits/MercadoLibreItemVisitsService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [MercadoLibreItemVisitsController],
  providers: [
    MercadoLibreItemVisitsService,
    {
      provide: 'ISQLMercadoLibreItemVisitsRepository',
      useClass: SQLMercadoLibreItemVisitsRepository
    }
  ],
  exports: [MercadoLibreItemVisitsService]
})
export class MercadoLibreVisitsModule {}
