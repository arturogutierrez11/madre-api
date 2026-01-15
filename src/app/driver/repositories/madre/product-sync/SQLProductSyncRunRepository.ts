import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IProductSyncRunRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRunRepository';
import { ProductSyncRunDto } from 'src/core/entities/product-sync/runs/dto/ProductSyncRunDtos';

@Injectable()
export class SQLProductSyncRunRepository implements IProductSyncRunRepository {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager
  ) {}

  async start(marketplace: string): Promise<string> {
    const id = randomUUID();

    await this.em.query(
      `
      INSERT INTO product_sync_runs (
        id, marketplace, status, started_at
      )
      VALUES (?, ?, 'RUNNING', NOW())
      `,
      [id, marketplace]
    );

    return id;
  }

  async increment(runId: string, data: { batches?: number; items?: number; failed?: number }): Promise<void> {
    await this.em.query(
      `
      UPDATE product_sync_runs
      SET
        batches_processed = batches_processed + ?,
        items_processed = items_processed + ?,
        items_failed = items_failed + ?
      WHERE id = ?
      `,
      [data.batches ?? 0, data.items ?? 0, data.failed ?? 0, runId]
    );
  }

  async finish(runId: string, status: 'SUCCESS' | 'PARTIAL'): Promise<void> {
    await this.em.query(
      `
      UPDATE product_sync_runs
      SET status = ?, finished_at = NOW()
      WHERE id = ?
      `,
      [status, runId]
    );
  }

  async fail(runId: string, errorMessage: string): Promise<void> {
    await this.em.query(
      `
      UPDATE product_sync_runs
      SET
        status = 'FAILED',
        error_message = ?,
        finished_at = NOW()
      WHERE id = ?
      `,
      [errorMessage, runId]
    );
  }

  async list(marketplace: string, limit: number, offset: number): Promise<ProductSyncRunDto[]> {
    return this.em.query(
      `
    SELECT
      id,
      marketplace,
      status,
      batches_processed,
      items_processed,
      items_failed,
      started_at,
      finished_at,
      error_message
    FROM product_sync_runs
    WHERE marketplace = ?
    ORDER BY started_at DESC
    LIMIT ? OFFSET ?
    `,
      [marketplace, limit, offset]
    );
  }
}
