import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceFavoritesController } from 'src/app/controller/mercadolibre/analitics/AnalyticsFavorites.controller';
import { SQLAnalyticsFavoritesRepository } from 'src/app/driver/repositories/mercadolibre/analitics/SQLAnalyticsFavoritesRepository';
import { MarketplaceFavoritesService } from 'src/app/services/mercadolibre/analitics/AnalitycsFavoritesService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [MarketplaceFavoritesController],
  providers: [
    MarketplaceFavoritesService,
    {
      provide: 'ISQLAnalyticsFavoritesRepository',
      useClass: SQLAnalyticsFavoritesRepository
    }
  ],
  exports: [MarketplaceFavoritesService]
})
export class MarketplaceFavoritesModule {}
