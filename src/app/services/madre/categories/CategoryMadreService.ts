import { Inject, Injectable } from '@nestjs/common';
import { ICategoriesMadreRepository } from 'src/core/adapters/repositories/madre/categories/ICategoriesMadreRepository';

@Injectable()
export class CategoryMadreService {
  constructor(
    @Inject('CategoriesMadreRepository')
    private readonly categoriesMadreRepository: ICategoriesMadreRepository
  ) {}

  async getCategoriesFromMadreDB(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    return this.categoriesMadreRepository.findCategoriesFromMadreDB({
      limit,
      offset
    });
  }
}
