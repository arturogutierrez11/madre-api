import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ICategoryMatchRepository } from 'src/core/adapters/repositories/madre/categories/match/ICategoryMatchRepository';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';
import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';

@Injectable()
export class CategoryMatchService {
  constructor(
    @Inject('CategoriesOncityRepository')
    private readonly oncityRepo: ICategoryMatchRepository,

    @Inject('CategoriesMegatoneRepository')
    private readonly megatoneRepo: ICategoryMatchRepository,

    @Inject('CategoriesFravegaRepository')
    private readonly fravegaRepo: ICategoryMatchRepository
  ) {}

  private getRepo(market: MarketName): ICategoryMatchRepository {
    switch (market) {
      case MarketName.ONCITY:
        return this.oncityRepo;
      case MarketName.MEGATONE:
        return this.megatoneRepo;
      case MarketName.FRAVEGA:
        return this.fravegaRepo;
      default:
        throw new BadRequestException(`Market inválido: ${market}`);
    }
  }

  async getCategoriesMatchPaginated(market: MarketName, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const repo = this.getRepo(market);

    const [items, total] = await Promise.all([repo.findAllCategoriesMatch(limit, offset), repo.countCategoriesMatch()]);

    const hasNext = offset + limit < total;

    return {
      total,
      limit,
      offset,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? offset + limit : null,
      items
    };
  }

  async saveCategoryMatch(
    market: MarketName,
    payload: CategoriesMatchToMarket | CategoriesMatchToMarket[]
  ): Promise<{ success: boolean }> {
    const repo = this.getRepo(market);

    if (Array.isArray(payload)) {
      await repo.upsertManyCategoryMatch(payload);
    } else {
      await repo.upsertCategoryMatch(payload);
    }

    return { success: true };
  }

  async skuHasCategoryMatch(market: MarketName, sku: string): Promise<boolean> {
    const repo = this.getRepo(market);
    return repo.existsSkuCategoryMatch(sku);
  }
}
