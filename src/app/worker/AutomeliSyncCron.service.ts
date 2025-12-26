import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AutomeliProductsRepository, PaginatedAutomeliResponse } from 'src/core/drivers/repositories/automeli/products/AutomeliProductsRepository';
import { IProductsRepository } from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { SyncHashService, ProductHashData } from './SyncHashService';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

const PAGES_PER_BATCH = 10;
const PRODUCTS_PER_PAGE = 100;

interface SyncStats {
  totalFetched: number;
  totalChanged: number;
  totalUpdated: number;
  batches: number;
  startTime: Date;
  endTime?: Date;
}

interface BatchResult {
  products: AutomeliProduct[];
  hasMorePages: boolean;
}

@Injectable()
export class AutomeliSyncCronService {
  private readonly sellerId: string;

  constructor(
    private readonly automeliRepository: AutomeliProductsRepository,
    @Inject('IProductsRepository')
    private readonly productRepository: IProductsRepository,
    private readonly syncHashService: SyncHashService,
    private readonly configService: ConfigService
  ) {
    this.sellerId = this.configService.get<string>('AUTOMELI_SELLER_ID', '');
  }

  /**
   * Run twice daily at 6:00 AM and 6:00 PM
   */
  @Cron('0 6,18 * * *')
  async handleCron() {
    console.log('[AutomeliSync] Cron triggered at', new Date().toISOString());
    await this.runSync();
  }

  /**
   * Main sync orchestration method
   */
  async runSync(): Promise<SyncStats> {
    const stats: SyncStats = {
      totalFetched: 0,
      totalChanged: 0,
      totalUpdated: 0,
      batches: 0,
      startTime: new Date()
    };

    // Check if another sync is running
    const lockAcquired = await this.syncHashService.acquireLock();
    if (!lockAcquired) {
      console.log('[AutomeliSync] Another sync is already running. Skipping this run.');
      return stats;
    }

    console.log('[AutomeliSync] Starting sync for seller:', this.sellerId);

    try {
      let basePage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        console.log(`[AutomeliSync] Processing batch starting at page ${basePage}`);

        // Fetch 20 pages in parallel
        const batchResult = await this.fetchBatch(basePage);
        stats.totalFetched += batchResult.products.length;
        stats.batches++;
        hasMorePages = batchResult.hasMorePages;

        console.log(`[AutomeliSync] Fetched ${batchResult.products.length} products in batch ${stats.batches}`);

        // Check if we've reached the end
        if (batchResult.products.length === 0) {
          console.log('[AutomeliSync] No more products to fetch');
          break;
        }

        // Filter to only changed products using hash comparison
        const changedProducts = await this.syncHashService.filterChangedProducts(batchResult.products);
        stats.totalChanged += changedProducts.length;

        console.log(`[AutomeliSync] Found ${changedProducts.length} changed products`);

        if (changedProducts.length > 0) {
          // Bulk update database
          const updatedCount = await this.bulkUpdate(changedProducts);
          stats.totalUpdated += updatedCount;

          // Update hashes in Redis for successfully updated products
          await this.syncHashService.updateHashes(changedProducts);

          console.log(`[AutomeliSync] Updated ${updatedCount} products in database`);
        }

        // Move to next batch
        basePage += PAGES_PER_BATCH;

        // Memory cleanup hint (Node.js will handle GC)
        // The batch arrays go out of scope here
      }

      stats.endTime = new Date();
      const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000;

      console.log('[AutomeliSync] Sync completed:', {
        ...stats,
        durationSeconds: duration
      });

      return stats;
    } catch (error) {
      console.error('[AutomeliSync] Sync failed:', error);
      throw error;
    } finally {
      await this.syncHashService.releaseLock();
    }
  }

  /**
   * Fetch 20 pages in parallel
   */
  private async fetchBatch(basePage: number): Promise<BatchResult> {
    const pagePromises: Promise<PaginatedAutomeliResponse>[] = [];

    for (let i = 0; i < PAGES_PER_BATCH; i++) {
      const page = basePage + i;
      pagePromises.push(this.fetchPage(page));
    }

    const results = await Promise.all(pagePromises);

    // Check if any page indicates there are more pages
    // The last page in the batch determines if we should continue
    const lastResult = results[results.length - 1];
    const hasMorePages = lastResult.pagination.hasNext;

    // Flatten all products into single array
    const products = results.flatMap((result) => result.products);

    return { products, hasMorePages };
  }

  /**
   * Fetch a single page from Automeli API
   */
  private async fetchPage(page: number): Promise<PaginatedAutomeliResponse> {
    try {
      return await this.automeliRepository.getLoadedProducts({
        sellerId: this.sellerId,
        appStatus: 1,
        page,
        perPage: PRODUCTS_PER_PAGE
      });
    } catch (error) {
      console.error(`[AutomeliSync] Failed to fetch page ${page}:`, error.message);
      // Return empty result on error to continue with other pages
      return {
        products: [],
        pagination: { page, perPage: PRODUCTS_PER_PAGE, hasNext: false, hasPrev: page > 1 }
      };
    }
  }

  /**
   * Bulk update products in the database
   */
  private async bulkUpdate(products: ProductHashData[]): Promise<number> {
    const updateData = products.map(({ product }) => ({
      sku: product.sku,
      price: product.meliSalePrice,
      stock: product.stockQuantity,
      status: this.mapStatus(product.meliStatus),
      shippingTime: this.parseManufacturingTime(product.manufacturingTime)
    }));

    return await (this.productRepository as any).bulkUpdateFromAutomeli(updateData);
  }

  /**
   * Map Automeli status to ProductMadre status
   */
  private mapStatus(meliStatus: string): 'active' | 'inactive' {
    return meliStatus === 'active' ? 'active' : 'inactive';
  }

  /**
   * Parse manufacturing time string to extract numeric days
   * "10 dias" -> 10
   * "5 días hábiles" -> 5
   */
  private parseManufacturingTime(value: string | null): number | null {
    if (!value) return null;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}
