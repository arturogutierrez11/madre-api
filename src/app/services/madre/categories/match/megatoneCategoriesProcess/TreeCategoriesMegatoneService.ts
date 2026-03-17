import { Inject, Injectable } from '@nestjs/common';
import { ISQLCategoriesMegatoneRepository } from 'src/core/adapters/repositories/madre/categories/match/megatoneCategoriesProcess/ISQLCategoriesMegatoneRepository';

@Injectable()
export class CategoriesMegatoneService {
  constructor(
    @Inject('ISQLCategoriesMegatoneRepository')
    private readonly repository: ISQLCategoriesMegatoneRepository
  ) {}

  async findByMeliCategoryId(meliCategoryId: string) {
    return this.repository.findByMeliCategoryId(meliCategoryId);
  }

  async existsMeliCategoryMatch(meliCategoryId: string) {
    return this.repository.existsMeliCategoryMatch(meliCategoryId);
  }

  async upsertMeliCategoryMatch(item: {
    meliCategoryId: string;
    meliCategoryPath: string;
    megatoneCategoryId: string;
    megatoneCategoryPath: string;
  }) {
    return this.repository.upsertMeliCategoryMatch(item);
  }

  async upsertManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      megatoneCategoryId: string;
      megatoneCategoryPath: string;
    }[]
  ) {
    return this.repository.upsertManyMeliCategoryMatch(items);
  }

  async findAllMeliCategoryMatches(limit?: number, offset?: number) {
    return this.repository.findAllMeliCategoryMatches(limit, offset);
  }
}
