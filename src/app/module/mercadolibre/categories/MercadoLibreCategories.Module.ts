import { Module } from '@nestjs/common';
import { MercadoLibreCategoriesController } from 'src/app/controller/mercadolibre/categories/MercadoLibreCategories.Controller';
import { SQLMercadoLibreCategoriesRepository } from 'src/app/driver/repositories/mercadolibre/categories/SQLMercadoLibreCategoriesRepository';

/**
 * Controller
 */

/**
 * Service
 */
import { MercadoLibreCategoriesService } from 'src/app/services/mercadolibre/categories/MercadoLibreCategoriesService';

/**
 * SQL Repository
 */

@Module({
  controllers: [MercadoLibreCategoriesController],

  providers: [
    /**
     * Service
     */
    MercadoLibreCategoriesService,

    /**
     * Repository binding
     */
    {
      provide: 'ISQLMercadoLibreCategoriesRepository',
      useClass: SQLMercadoLibreCategoriesRepository
    }
  ],

  exports: [MercadoLibreCategoriesService, 'ISQLMercadoLibreCategoriesRepository']
})
export class MercadoLibreCategoriesModule {}
