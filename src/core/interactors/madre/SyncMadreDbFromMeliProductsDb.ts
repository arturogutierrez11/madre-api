import { Inject, Injectable } from '@nestjs/common';
import { ISQLMercadoLibreProductsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsDetails/ISQLMercadoLibreProductsRepository';
import { IProductsRepository, MeliProductImportData } from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { ISyncLock } from 'src/core/adapters/locks/ISyncLock';
import { IMercadoLibreApiClient } from 'src/core/adapters/mercadolibre/api/IMercadoLibreApiClient';
import { MeliProductsImportState, MeliProductHashData } from './MeliProductsImportState';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';
import { cleanMeliDescription } from 'src/core/utils/cleanMeliDescription';

const PAGE_SIZE = 1000;
const PROCESS_CHUNK_SIZE = 20;

interface SyncStats {
  totalFetched: number;
  totalChanged: number;
  totalUpserted: number;
  totalHashesUpdated: number;
  totalSkipped: number;
  pages: number;
  startTime: Date;
  endTime?: Date;
}

@Injectable()
export class SyncMadreDbFromMeliProductsDb {
  constructor(
    @Inject('ISQLMercadoLibreProductsRepository')
    private readonly meliProductsRepository: ISQLMercadoLibreProductsRepository,

    @Inject('IProductsRepository')
    private readonly productRepository: IProductsRepository,

    @Inject('IMeliProductsImportSyncLock')
    private readonly syncLock: ISyncLock,

    @Inject('IMercadoLibreApiClient')
    private readonly meliApiClient: IMercadoLibreApiClient,

    private readonly productsStateService: MeliProductsImportState
  ) {}

  async runSync(): Promise<SyncStats> {
    const stats: SyncStats = {
      totalFetched: 0,
      totalChanged: 0,
      totalUpserted: 0,
      totalHashesUpdated: 0,
      totalSkipped: 0,
      pages: 0,
      startTime: new Date()
    };

    const lockAcquired = await this.syncLock.acquire();
    if (!lockAcquired) {
      console.log('[MeliProductsImport] Another import is already running. Skipping.');
      return stats;
    }

    console.log('[MeliProductsImport] Starting product import from mercadolibre_products');

    try {
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        stats.pages++;
        console.log(`[MeliProductsImport] Fetching page ${stats.pages} (offset: ${offset}, limit: ${PAGE_SIZE})`);

        const result = await this.meliProductsRepository.findDeduplicatedBySku({
          limit: PAGE_SIZE,
          offset
        });

        const products = result.items;
        stats.totalFetched += products.length;

        console.log(`[MeliProductsImport] Fetched ${products.length} deduplicated products (total unique SKUs: ${result.total})`);

        if (products.length > 0) {
          const changedProducts = await this.productsStateService.filterChangedProducts(products);
          stats.totalChanged += changedProducts.length;
          stats.totalSkipped += products.length - changedProducts.length;

          console.log(
            `[MeliProductsImport] Found ${changedProducts.length} changed products (${products.length - changedProducts.length} unchanged)`
          );

          if (changedProducts.length > 0) {
            const upserted = await this.processInChunks(changedProducts);
            stats.totalUpserted += upserted;

            await this.productsStateService.updateHashes(changedProducts);
            stats.totalHashesUpdated += changedProducts.length;

            console.log(
              `[MeliProductsImport] Upserted ${upserted} products in DB, ${changedProducts.length} hashes in Redis`
            );
          }
        }

        hasMore = result.hasMore;
        offset += PAGE_SIZE;

        if (!hasMore) {
          console.log('[MeliProductsImport] No more pages to fetch');
        }
      }

      stats.endTime = new Date();
      const durationMs = stats.endTime.getTime() - stats.startTime.getTime();
      this.logSummary(stats, this.formatDuration(durationMs));

      return stats;
    } catch (error) {
      console.error('[MeliProductsImport] Import failed:', error);
      throw error;
    } finally {
      await this.syncLock.release();
    }
  }

  private async processInChunks(changedProducts: MeliProductHashData[]): Promise<number> {
    let totalUpserted = 0;

    for (let i = 0; i < changedProducts.length; i += PROCESS_CHUNK_SIZE) {
      const chunk = changedProducts.slice(i, i + PROCESS_CHUNK_SIZE);

      const importData = await Promise.all(
        chunk.map(({ product }) => this.mapToImportData(product))
      );

      const upserted = await this.productRepository.bulkUpsertFromMeliProducts(importData);
      totalUpserted += upserted;
    }

    return totalUpserted;
  }

  private async mapToImportData(mlProduct: MercadoLibreProduct): Promise<MeliProductImportData> {
    let description = '';
    try {
      const descResult = await this.meliApiClient.getItemDescription(mlProduct.id);
      const [cleaned] = cleanMeliDescription(descResult.plainText);
      description = cleaned ?? '';
    } catch (error: any) {
      console.error(`[MeliProductsImport] Failed to fetch description for ${mlProduct.id}:`, error.message);
    }

    let categoryPath = '';
    try {
      if (mlProduct.categoryId) {
        categoryPath = await this.meliApiClient.getCategoryPath(mlProduct.categoryId);
      }
    } catch (error: any) {
      console.error(`[MeliProductsImport] Failed to fetch category for ${mlProduct.id}:`, error.message);
    }

    const images = (mlProduct.pictures ?? [])
      .slice(0, 10)
      .map((url, i) => ({ position: i + 1, url }));

    return {
      sku: mlProduct.sellerSku!,
      title: mlProduct.title,
      description,
      categoryPath,
      price: mlProduct.price,
      stock: mlProduct.stock,
      status: 'inactive',
      images,
      categoryMLA: mlProduct.categoryId ?? null,
      attributes: {
        brand: mlProduct.brand ?? undefined,
        color: undefined,
        raw: { marca: mlProduct.brand ?? null, color: null }
      }
    };
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private logSummary(stats: SyncStats, duration: string): void {
    const separator = '═'.repeat(50);
    const changeRate = stats.totalFetched > 0
      ? ((stats.totalChanged / stats.totalFetched) * 100).toFixed(2)
      : '0.00';

    console.log(`
${separator}
  MELI PRODUCTS IMPORT COMPLETED
${separator}

  Duration:              ${duration}
  Pages processed:       ${stats.pages}

  ─── PRODUCTS ───────────────────────────────────
  Total fetched:         ${stats.totalFetched.toLocaleString()}
  Changed (need upsert): ${stats.totalChanged.toLocaleString()} (${changeRate}%)
  Skipped (unchanged):   ${stats.totalSkipped.toLocaleString()}

  ─── DATABASE ───────────────────────────────────
  Products upserted:     ${stats.totalUpserted.toLocaleString()}

  ─── REDIS CACHE ────────────────────────────────
  Hashes updated:        ${stats.totalHashesUpdated.toLocaleString()}

${separator}
`);
  }
}
