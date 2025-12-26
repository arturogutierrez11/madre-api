import { Inject } from '@nestjs/common';
import { IBrandsMadreRepository } from 'src/core/adapters/repositories/madre/brands/IBrandsMadreRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { MadreBrand } from 'src/core/entities/madre/brands/MadreBrand';

export class BrandMadreService {
  constructor(
    @Inject('IBrandsMadreRepository')
    private readonly brandsMadreRepository: IBrandsMadreRepository
  ) {}

  async listAllBrandsofMadre(page = 1, limit = 20): Promise<PaginatedResult<MadreBrand>> {
    const offset = (page - 1) * limit;

    const result = await this.brandsMadreRepository.findBrandsFromMadreDB({
      limit: Number(limit),
      offset: Number(offset)
    });

    return {
      ...result,
      items: result.items.map((name, index) => ({
        id: offset + index + 1,
        name
      }))
    };
  }
}
