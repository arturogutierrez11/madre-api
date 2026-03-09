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

  // =========================
  // ML → FRAVEGA CATEGORY MATCH
  // =========================

  async findByMeliCategoryId(meliCategoryId: string) {
    return this.fravegaCategoriesProcess.findByMeliCategoryId(meliCategoryId);
  }

  async existsMeliCategoryMatch(meliCategoryId: string) {
    const exists = await this.fravegaCategoriesProcess.existsMeliCategoryMatch(meliCategoryId);

    return {
      meliCategoryId,
      exists
    };
  }

  async saveMeliCategoryMatch(item: {
    meliCategoryId: string;
    meliCategoryPath: string;
    fravegaCategoryId: string;
    fravegaCategoryPath: string;
  }) {
    await this.fravegaCategoriesProcess.upsertMeliCategoryMatch(item);

    return {
      success: true,
      message: 'Category match saved',
      item
    };
  }

  async saveManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }[]
  ) {
    await this.fravegaCategoriesProcess.upsertManyMeliCategoryMatch(items);

    return {
      success: true,
      inserted: items.length
    };
  }

  async getAllMeliCategoryMatches(page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const results = await this.fravegaCategoriesProcess.findAllMeliCategoryMatches(limit, offset);

    return {
      page,
      limit,
      count: results.length,
      data: results
    };
  }
}
