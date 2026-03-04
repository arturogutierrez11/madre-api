import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/IBrandMatchRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';

@Injectable()
export class BrandMatchService {
  constructor(
    @Inject('BrandsOncityRepository')
    private readonly oncityRepo: IBrandMatchRepository,

    @Inject('BrandsMegatoneRepository')
    private readonly megatoneRepo: IBrandMatchRepository,

    @Inject('BrandsFravegaRepository')
    private readonly fravegaRepo: IBrandMatchRepository
  ) {}

  private getRepo(market: MarketName): IBrandMatchRepository {
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

  async getBrandMatchesPaginated(
    market: MarketName,
    page = 1,
    limit = 50
  ): Promise<PaginatedResult<BrandsMatchtoMarket>> {
    const offset = (page - 1) * limit;
    const repo = this.getRepo(market);

    const [items, total] = await Promise.all([repo.findAllBrandsMatch(limit, offset), repo.countBrandsMatch()]);

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
  async saveBrandMatch(
    market: MarketName,
    payload: BrandsMatchtoMarket | BrandsMatchtoMarket[]
  ): Promise<{ success: boolean }> {
    const repo = this.getRepo(market);

    if (Array.isArray(payload)) {
      await repo.upsertManyBrandMatch(payload);
    } else {
      await repo.upsertBrandMatch(payload);
    }

    return { success: true };
  }
}
