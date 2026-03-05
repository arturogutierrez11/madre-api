import { Inject, Injectable } from '@nestjs/common';
import { ISLQTreeCategories } from 'src/core/adapters/repositories/madre/categories/match/fravegaCategoriesProcess/ISLQTreeCategories';

@Injectable()
export class TreeCategoriesServices {
  constructor(
    @Inject('ISLQTreeCategories')
    private readonly fravegaCategoriesProcess: ISLQTreeCategories
  ) {}

  async getFravegaCategoriesTree() {
    return this.fravegaCategoriesProcess.getCategoriesTree();
  }
  async getCategoryAttributes(categoryId: string) {
    return this.fravegaCategoriesProcess.getCategoryAttributes(categoryId);
  }
}
