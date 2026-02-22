import { Inject, Injectable } from '@nestjs/common';
import { ISQLAnalyticsFavoritesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/ISQLAnalyticsFavoritesRepository';

@Injectable()
export class MarketplaceFavoritesService {
  constructor(
    @Inject('ISQLAnalyticsFavoritesRepository')
    private readonly repository: ISQLAnalyticsFavoritesRepository
  ) {}

  async createMarketplace(name: string) {
    return this.repository.createMarketplace(name);
  }

  async getMarketplaces() {
    return this.repository.getMarketplaces();
  }

  async addFavorite(marketplaceId: number, productId: string, sellerSku: string) {
    return this.repository.addFavorite(marketplaceId, productId, sellerSku);
  }

  async removeFavorite(marketplaceId: number, productId: string) {
    return this.repository.removeFavorite(marketplaceId, productId);
  }

  async getFavorites(marketplaceId: number) {
    return this.repository.getFavorites(marketplaceId);
  }
}
