import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsBrandsController } from 'src/app/controller/mercadolibre/analitics/AnalyticsBrands.Controller';
import { SQLAnalyticsBrandsRepository } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsBrandsRepository';
import { SQLAnalyticsProductsRepository } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsProductsRepository';
import { GetAnalyticsBrands } from 'src/app/services/mercadolibre/analitics/AnalyticsBrandsService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [AnalyticsBrandsController],
  providers: [
    GetAnalyticsBrands,
    {
      provide: 'IAnalyticsBrandsRepository',
      useClass: SQLAnalyticsBrandsRepository
    },
    {
      provide: 'IAnalyticsProductsRepository',
      useClass: SQLAnalyticsProductsRepository
    }
  ],
  exports: [GetAnalyticsBrands]
})
export class AnalyticsBrandsModule {}
