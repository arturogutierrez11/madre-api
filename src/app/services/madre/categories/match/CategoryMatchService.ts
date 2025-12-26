import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ICategoryMatchRepository } from 'src/core/adapters/repositories/madre/categories/match/ICategoryMatchRepository';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';

@Injectable()
export class CategoryMatchService {
  constructor(
    @Inject('CategoriesOncityRepository')
    private readonly oncityRepo: ICategoryMatchRepository,

    @Inject('CategoriesMegatoneRepository')
    private readonly megatoneRepo: ICategoryMatchRepository
  ) {}

  private getRepo(market: MarketName): ICategoryMatchRepository {
    switch (market) {
      case MarketName.ONCITY:
        return this.oncityRepo;
      case MarketName.MEGATONE:
        return this.megatoneRepo;
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
}
