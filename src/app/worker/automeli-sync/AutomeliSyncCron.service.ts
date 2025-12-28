import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IAutomeliProductsRepository } from 'src/core/adapters/repositories/automeli/products/IAutomeliProductsRepository';
import { IProductsRepository } from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';
import { ISyncLock } from 'src/core/adapters/locks/ISyncLock';
import { AutomeliProductsStateService, ProductHashData } from './AutomeliProductsState.service';
import { ProductStateHasher } from './ProductStateHasher';

const PAGES_PER_BATCH = 20;
const PRODUCTS_PER_PAGE = 1000;
const FETCH_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 500;

interface SyncStats {
  totalFetched: number;
  totalChanged: number;
  totalUpdated: number;
  totalHashesUpdated: number;
  totalSkipped: number;
  batches: number;
  startTime: Date;
  endTime?: Date;
}

interface PageFetchResult {
  ok: boolean;
  products: AutomeliProduct[];
}

@Injectable()
export class AutomeliSyncCronService {
  private readonly sellerId: string;

  constructor(
    @Inject('IAutomeliProductsRepository')
    private readonly automeliRepository: IAutomeliProductsRepository,
    @Inject('IProductsRepository')
    private readonly productRepository: IProductsRepository,
    @Inject('ISyncLock')
    private readonly syncLock: ISyncLock,
    private readonly productsStateService: AutomeliProductsStateService,
    private readonly hasher: ProductStateHasher,
    private readonly configService: ConfigService
  ) {
    this.sellerId = this.configService.get<string>('AUTOMELI_SELLER_ID', '');
  }

  /**
   * Run every 6 hours at 00:00, 06:00, 12:00, 18:00 (Buenos Aires time)
   */
  @Cron('0 0 0,6,12,18 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async handleCron() {
    console.log('[AutomeliSync] Cron triggered at', new Date().toISOString());
    await this.runSync();
  }

  async runSync(): Promise<SyncStats> {
    const stats: SyncStats = {
      totalFetched: 0,
      totalChanged: 0,
      totalUpdated: 0,
      totalHashesUpdated: 0,
      totalSkipped: 0,
      batches: 0,
      startTime: new Date()
    };

    // Check if another sync is running
    const lockAcquired = await this.syncLock.acquire();
    if (!lockAcquired) {
      console.log('[AutomeliSync] Another sync is already running. Skipping this run.');
      return stats;
    }

    console.log('[AutomeliSync] Starting sync for seller:', this.sellerId);

    try {
      let basePage = 1;

      while (true) {
        console.log(`[AutomeliSync] Processing batch starting at page ${basePage}`);

        // Fetch 20 pages in parallel (aux paging)
        const { products, endReached } = await this.fetchBatch(basePage);
        stats.totalFetched += products.length;
        stats.batches++;

        console.log(`[AutomeliSync] Fetched ${products.length} products in batch ${stats.batches}`);

        // Stop when the whole batch is empty (and no failures)
        if (endReached) {
          console.log('[AutomeliSync] End reached (all pages empty in batch)');
          break;
        }

        // Filter to only changed products using hash comparison
        const changedProducts = await this.productsStateService.filterChangedProducts(products);
        stats.totalChanged += changedProducts.length;
        stats.totalSkipped += products.length - changedProducts.length;

        console.log(
          `[AutomeliSync] Found ${changedProducts.length} changed products (${products.length - changedProducts.length} unchanged)`
        );

        if (changedProducts.length > 0) {
          // Bulk update database
          const updatedCount = await this.bulkUpdate(changedProducts);
          stats.totalUpdated += updatedCount;

          // Update hashes in Redis for successfully updated products
          await this.productsStateService.updateHashes(changedProducts);
          stats.totalHashesUpdated += changedProducts.length;

          console.log(`[AutomeliSync] Updated ${updatedCount} products in database, ${changedProducts.length} hashes in Redis`);
        }

        // Move to next batch
        basePage += PAGES_PER_BATCH;
      }

      stats.endTime = new Date();
      const durationMs = stats.endTime.getTime() - stats.startTime.getTime();
      const durationFormatted = this.formatDuration(durationMs);

      this.logSummary(stats, durationFormatted);

      return stats;
    } catch (error) {
      console.error('[AutomeliSync] Sync failed:', error);
      throw error;
    } finally {
      await this.syncLock.release();
    }
  }

  private async fetchBatch(basePage: number): Promise<{ products: AutomeliProduct[]; endReached: boolean }> {
    const pagePromises: Promise<PageFetchResult>[] = [];

    for (let i = 0; i < PAGES_PER_BATCH; i++) {
      const page = basePage + i;
      pagePromises.push(this.fetchPage(page));
    }

    const results = await Promise.all(pagePromises);

    const endReached = results.every(r => r.ok && r.products.length === 0);
    const products = results.flatMap(r => r.products);

    return { products, endReached };
  }

  private async fetchPage(page: number): Promise<PageFetchResult> {
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const products = await this.automeliRepository.getLoadedProducts({
          sellerId: this.sellerId,
          appStatus: 1,
          aux: page
        });

        return { ok: true, products };
      } catch (error) {
        const message = error?.message ?? error;
        console.error(
          `[AutomeliSync] Failed to fetch page ${page} (attempt ${attempt}/${FETCH_RETRIES}):`,
          message
        );

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
        }
      }
    }

    // After all retries, mark as failed so it won't trigger end-of-data
    return { ok: false, products: [] };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private async bulkUpdate(products: ProductHashData[]): Promise<number> {
    const updateData = products.map(({ product }) => ({
      sku: product.sku,
      price: product.meliSalePrice,
      stock: product.stockQuantity,
      status: this.mapStatus(product.meliStatus),
      shippingTime: this.hasher.parseManufacturingTime(product.manufacturingTime)
    }));

    return await (this.productRepository as any).bulkUpdateFromAutomeli(updateData);
  }

  private mapStatus(meliStatus: string): 'active' | 'inactive' {
    return meliStatus === 'active' ? 'active' : 'inactive';
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  private logSummary(stats: SyncStats, duration: string): void {
    const separator = '═'.repeat(50);
    const changeRate = stats.totalFetched > 0
      ? ((stats.totalChanged / stats.totalFetched) * 100).toFixed(2)
      : '0.00';

    console.log(`
${separator}
  AUTOMELI SYNC COMPLETED
${separator}

  Duration:              ${duration}
  Batches processed:     ${stats.batches}

  ─── PRODUCTS ───────────────────────────────────
  Total fetched:         ${stats.totalFetched.toLocaleString()}
  Changed (need update): ${stats.totalChanged.toLocaleString()} (${changeRate}%)
  Skipped (unchanged):   ${stats.totalSkipped.toLocaleString()}

  ─── DATABASE ───────────────────────────────────
  Products updated:      ${stats.totalUpdated.toLocaleString()}

  ─── REDIS CACHE ────────────────────────────────
  Hashes updated:        ${stats.totalHashesUpdated.toLocaleString()}

${separator}
`);
  }
}
