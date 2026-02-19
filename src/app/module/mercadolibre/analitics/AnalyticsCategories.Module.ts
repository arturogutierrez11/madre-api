import { Module } from '@nestjs/common';
import { AnalyticsCategoriesController } from 'src/app/controller/mercadolibre/analitics/AnalyticsCategories.Controller';
import { SQLAnalyticsCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsCategoriesRepository';
import { SQLMercadoLibreCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/categories/SQLMercadoLibreCategoriesRepository';
import { AnalyticsCategoriesService } from 'src/app/services/mercadolibre/analitics/AnalyticsCategoriesService';

@Module({
  controllers: [AnalyticsCategoriesController],

  providers: [
    AnalyticsCategoriesService,

    {
      provide: 'IAnalyticsCategoriesRepository',
      useClass: SQLAnalyticsCategoriesRepository
    },
    {
      provide: 'ISQLMercadoLibreCategoriesRepository',
      useClass: SQLMercadoLibreCategoriesRepository
    }
  ],

  exports: [AnalyticsCategoriesService]
})
export class AnalyticsCategoriesModule {}
