import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ISQLMercadoLibreCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/categories/ISQLMercadoLibreCategoriesRepository';
import { FlatCategory, MercadoLibreCategory } from 'src/core/entities/mercadolibre/categories/MercadoLibreCategory';

@Injectable()
export class MercadoLibreCategoriesService {
  constructor(
    @Inject('ISQLMercadoLibreCategoriesRepository')
    private readonly categoriesRepository: ISQLMercadoLibreCategoriesRepository
  ) {}

  // ─────────────────────────────────────────────
  // SAVE BULK (UPSERT MANY)
  // ─────────────────────────────────────────────
  async saveCategories(categories: FlatCategory[]): Promise<{ saved: number }> {
    if (!categories || !categories.length) {
      throw new BadRequestException('categories array is required');
    }

    await this.categoriesRepository.upsertMany(categories);

    return { saved: categories.length };
  }

  // ─────────────────────────────────────────────
  // GET ONE
  // ─────────────────────────────────────────────
  async getById(id: string): Promise<MercadoLibreCategory | null> {
    if (!id) {
      throw new BadRequestException('id is required');
    }

    return this.categoriesRepository.findById(id);
  }

  // ─────────────────────────────────────────────
  // GET CHILDREN
  // ─────────────────────────────────────────────
  async getChildren(parentId: string | null): Promise<MercadoLibreCategory[]> {
    return this.categoriesRepository.findChildren(parentId);
  }

  // ─────────────────────────────────────────────
  // GET FULL TREE (flat ordered)
  // ─────────────────────────────────────────────
  async getTree(): Promise<MercadoLibreCategory[]> {
    return this.categoriesRepository.findTree();
  }

  // ─────────────────────────────────────────────
  // GET SUBTREE
  // ─────────────────────────────────────────────
  async getSubTree(categoryId: string): Promise<MercadoLibreCategory[]> {
    if (!categoryId) {
      throw new BadRequestException('categoryId is required');
    }

    return this.categoriesRepository.findSubTree(categoryId);
  }
}
