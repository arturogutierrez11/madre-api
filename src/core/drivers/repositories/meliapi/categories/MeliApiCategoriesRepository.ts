import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IMeliApiCategoriesRepository } from 'src/core/adapters/repositories/meliapi/categories/IMeliApiCategoriesRepository';

const DEFAULT_MELI_GATEWAY_BASE_URL = 'https://api.meli.loquieroaca.com';
const FETCH_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 500;

interface MeliApiCategoryNode {
  id: string;
  name: string;
}

@Injectable()
export class MeliApiCategoriesRepository implements IMeliApiCategoriesRepository {
  private readonly categoryCache = new Map<string, string>();
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'MELI_GATEWAY_BASE_URL',
      DEFAULT_MELI_GATEWAY_BASE_URL
    );
  }

  async getCategoryPath(categoryId: string): Promise<string> {
    if (!categoryId) return '';

    const cached = this.categoryCache.get(categoryId);
    if (cached !== undefined) return cached;

    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/meli/categories/${categoryId}/raw`
        );

        const pathFromRoot: MeliApiCategoryNode[] = response.data?.path_from_root ?? [];
        const path = pathFromRoot.map(node => node.name).join(' > ');
        this.categoryCache.set(categoryId, path);
        return path;
      } catch (error: any) {
        if (error.response?.status === 404) {
          this.categoryCache.set(categoryId, '');
          return '';
        }

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
          continue;
        }

        console.error(
          `[MeliApiCategoriesRepository] Failed to get category ${categoryId} after ${FETCH_RETRIES} retries:`,
          error.response?.status ?? error.message
        );
        this.categoryCache.set(categoryId, '');
        return '';
      }
    }

    return '';
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
