import { Inject, Injectable } from '@nestjs/common';
import {
  AutomeliPaginatedResponse,
  IAutomeliProductsRepository
} from 'src/core/adapters/repositories/automeli/products/IAutomeliProductsRepository';
import {
  IProductsRepository,
  ProductWeightUpdateData
} from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { ISyncLock } from 'src/core/adapters/locks/ISyncLock';

const FETCH_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 500;

interface BackfillStats {
  missingSkusAtStart: number;
  totalFetched: number;
  totalMatched: number;
  totalUpdated: number;
  requests: number;
  startTime: Date;
  endTime?: Date;
  remainingSkus: number;
}

@Injectable()
export class BackfillMadreProductWeightsFromAutomeli {
  constructor(
    @Inject('IAutomeliProductsRepository')
    private readonly automeliRepository: IAutomeliProductsRepository,

    @Inject('IProductsRepository')
    private readonly productRepository: IProductsRepository,

    @Inject('ISyncLock')
    private readonly syncLock: ISyncLock,

    @Inject('AUTOMELI_SELLER_ID')
    private readonly sellerId: string
  ) {}

  async run(): Promise<BackfillStats> {
    const missingSkus = new Set(await this.productRepository.findSkusWithoutMaxWeight());
    const stats: BackfillStats = {
      missingSkusAtStart: missingSkus.size,
      totalFetched: 0,
      totalMatched: 0,
      totalUpdated: 0,
      requests: 0,
      startTime: new Date(),
      remainingSkus: missingSkus.size
    };

    if (missingSkus.size === 0) {
      console.log('[WeightBackfill] No hay SKUs sin max_weight para reparar.');
      stats.endTime = new Date();
      return stats;
    }

    const lockAcquired = await this.syncLock.acquire();
    if (!lockAcquired) {
      console.log('[WeightBackfill] Otro proceso de sync ya está corriendo. Se cancela el backfill.');
      stats.endTime = new Date();
      return stats;
    }

    console.log(`[WeightBackfill] Iniciando backfill para ${missingSkus.size.toLocaleString()} SKUs sin peso`);

    try {
      let cursor: string | undefined = undefined;
      let hasMore = true;

      while (hasMore && missingSkus.size > 0) {
        stats.requests++;
        console.log(
          `[WeightBackfill] Fetching page ${stats.requests}${cursor ? ` (cursor: ${cursor.substring(0, 20)}...)` : ' (initial)'}`
        );

        const fetchResult = await this.fetchProducts(cursor);
        if (!fetchResult.ok) {
          console.error('[WeightBackfill] No se pudo obtener productos de Automeli después de reintentos');
          break;
        }

        const response = fetchResult.response;
        const products = response.data;
        stats.totalFetched += products.length;

        const updates: ProductWeightUpdateData[] = [];

        for (const product of products) {
          const normalizedSku = String(product.sku ?? '').trim().toUpperCase();
          if (!normalizedSku || !missingSkus.has(normalizedSku)) {
            continue;
          }

          if (product.maxWeight == null) {
            continue;
          }

          updates.push({
            sku: normalizedSku,
            maxWeight: Number(product.maxWeight)
          });
        }

        if (updates.length > 0) {
          const uniqueUpdates = this.deduplicateUpdates(updates);
          const updatedCount = await this.productRepository.bulkUpdateMaxWeightBySku(uniqueUpdates);

          stats.totalMatched += uniqueUpdates.length;
          stats.totalUpdated += updatedCount;

          for (const update of uniqueUpdates) {
            missingSkus.delete(update.sku);
          }

          stats.remainingSkus = missingSkus.size;

          console.log(
            `[WeightBackfill] Matched ${uniqueUpdates.length} SKUs con peso. Updated ${updatedCount}. Remaining ${missingSkus.size}`
          );
        }

        hasMore = response.has_more;
        cursor = response.next_cursor ?? undefined;
      }

      stats.endTime = new Date();
      this.logSummary(stats);
      return stats;
    } finally {
      await this.syncLock.release();
    }
  }

  private deduplicateUpdates(updates: ProductWeightUpdateData[]): ProductWeightUpdateData[] {
    const map = new Map<string, ProductWeightUpdateData>();
    for (const update of updates) {
      map.set(update.sku, update);
    }
    return Array.from(map.values());
  }

  private async fetchProducts(cursor?: string): Promise<{ ok: boolean; response: AutomeliPaginatedResponse }> {
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await this.automeliRepository.getLoadedProducts({
          sellerId: this.sellerId,
          appStatus: 1,
          cursor
        });

        return { ok: true, response };
      } catch (error) {
        const message = error?.message ?? error;
        console.error(
          `[WeightBackfill] Error trayendo productos (attempt ${attempt}/${FETCH_RETRIES}):`,
          message
        );

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
        }
      }
    }

    return {
      ok: false,
      response: { data: [], next_cursor: null, has_more: false, count: 0 }
    };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private logSummary(stats: BackfillStats) {
    const durationMs = (stats.endTime?.getTime() ?? Date.now()) - stats.startTime.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const duration = minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;

    console.log(`
══════════════════════════════════════════════════
  WEIGHT BACKFILL COMPLETED
══════════════════════════════════════════════════

  Duration:              ${duration}
  API requests:          ${stats.requests}

  Missing at start:      ${stats.missingSkusAtStart.toLocaleString()}
  Products fetched:      ${stats.totalFetched.toLocaleString()}
  SKUs matched:          ${stats.totalMatched.toLocaleString()}
  Rows updated:          ${stats.totalUpdated.toLocaleString()}
  Remaining missing:     ${stats.remainingSkus.toLocaleString()}

══════════════════════════════════════════════════
`);
  }
}
