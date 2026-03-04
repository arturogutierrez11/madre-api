import { Module } from '@nestjs/common';
import { AnalyticsCategoriesController } from 'src/app/controller/mercadolibre/analitics/AnalyticsCategories.Controller';
import { SQLAnalyticsCacheCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/analitics/categories/SQLAnalyticsCacheCategoriesRepository';
import { SQLAnalyticsCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/analitics/categories/SQLAnalyticsCategoriesRepository';
import { SQLMercadoLibreCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/categories/SQLMercadoLibreCategoriesRepository';
import { AnalyticsCategoriesService } from 'src/app/services/mercadolibre/analitics/categories/AnalyticsCategoriesService';

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
    },
    {
      provide: 'ISQLAnalyticsCacheCategoriesRepository',
      useClass: SQLAnalyticsCacheCategoriesRepository
    }
  ],

  exports: [AnalyticsCategoriesService]
})
export class AnalyticsCategoriesModule {}
