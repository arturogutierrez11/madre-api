import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsProductsController } from 'src/app/controller/mercadolibre/analitics/analyticsProducts.Controller';
import { SQLAnalyticsProductsRepository } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsProductsRepository';
import { GetAnalyticsProducts } from 'src/app/services/mercadolibre/analitics/AnalyticsProductsService';

@Module({
  imports: [TypeOrmModule.forFeature([])],

  controllers: [AnalyticsProductsController],

  providers: [
    GetAnalyticsProducts,
    {
      provide: 'IAnalyticsProductsRepository',
      useClass: SQLAnalyticsProductsRepository
    }
  ]
})
export class AnalyticsModule {}
