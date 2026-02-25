import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISQLAnalyticsFavoritesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/ISQLAnalyticsFavoritesRepository';

@Injectable()
export class MarketplaceFavoritesService {
  constructor(
    @Inject('ISQLAnalyticsFavoritesRepository')
    private readonly repository: ISQLAnalyticsFavoritesRepository
  ) {}

  /* ================= MARKETPLACES ================= */

  async createMarketplace(name: string) {
    return this.repository.createMarketplace(name);
  }

  async getMarketplaces() {
    return this.repository.getMarketplaces();
  }

  async updateMarketplaceStatus(id: number, status: 'active' | 'closed') {
    const marketplace = await this.repository.getMarketplaceById(id);

    if (!marketplace) {
      throw new NotFoundException('Marketplace not found');
    }

    return this.repository.updateMarketplaceStatus(id, status);
  }

  /* ================= FAVORITES ================= */

  async addFavorite(marketplaceId: number, productId: string, sellerSku: string) {
    await this.ensureMarketplaceIsActive(marketplaceId);

    return this.repository.addFavorite(marketplaceId, productId, sellerSku);
  }

  async removeFavorite(marketplaceId: number, productId: string) {
    await this.ensureMarketplaceIsActive(marketplaceId);

    return this.repository.removeFavorite(marketplaceId, productId);
  }

  async getFavorites(marketplaceId: number) {
    return this.repository.getFavorites(marketplaceId);
  }

  async addFavoritesBulk(marketplaceIds: number[], items: { productId: string; sellerSku: string }[]) {
    for (const id of marketplaceIds) {
      await this.ensureMarketplaceIsActive(id);
    }

    await Promise.all(marketplaceIds.map(id => this.repository.addFavoritesBulk(id, items)));

    return {
      success: true,
      marketplacesAffected: marketplaceIds.length,
      itemsPerMarketplace: items.length
    };
  }

  /* ================= ANALYTICS ================= */

  async getMarketplaceOverview(marketplaceId: number) {
    return this.repository.getMarketplaceOverview(marketplaceId);
  }

  async getMarketplaceBrandsBreakdown(marketplaceId: number) {
    return this.repository.getMarketplaceBrandsBreakdown(marketplaceId);
  }

  async getMarketplaceCategoriesBreakdown(marketplaceId: number) {
    return this.repository.getMarketplaceCategoriesBreakdown(marketplaceId);
  }

  async getMarketplaceFullOverview(marketplaceId: number) {
    const [overview, brands, categories] = await Promise.all([
      this.repository.getMarketplaceOverview(marketplaceId),
      this.repository.getMarketplaceBrandsBreakdown(marketplaceId),
      this.repository.getMarketplaceCategoriesBreakdown(marketplaceId)
    ]);

    return {
      overview,
      brands,
      categories
    };
  }

  /* ================= INTERNAL GUARD ================= */

  private async ensureMarketplaceIsActive(marketplaceId: number) {
    const marketplace = await this.repository.getMarketplaceById(marketplaceId);

    if (!marketplace) {
      throw new NotFoundException('Marketplace not found');
    }

    if (marketplace.status === 'closed') {
      throw new BadRequestException('Marketplace is closed and cannot be modified');
    }
  }

  async deleteMarketplace(id: number) {
    const marketplace = await this.repository.getMarketplaceById(id);

    if (!marketplace) {
      throw new NotFoundException('Marketplace not found');
    }

    if (marketplace.status === 'closed') {
      throw new BadRequestException('Closed marketplace cannot be deleted');
    }

    return this.repository.deleteMarketplace(id);
  }
}
