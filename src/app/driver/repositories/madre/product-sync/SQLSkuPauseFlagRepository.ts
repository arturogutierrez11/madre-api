import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ISkuPauseFlagRepository,
  ListSkuPauseFlagsFilters,
  SkuPauseFlagRecord
} from 'src/core/adapters/repositories/madre/product-sync/ISkuPauseFlagRepository';

type GenericRow = Record<string, any>;

@Injectable()
export class SQLSkuPauseFlagRepository implements ISkuPauseFlagRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async upsert(sku: string, paused: boolean): Promise<SkuPauseFlagRecord> {
    await this.entityManager.query(
      `
        INSERT INTO product_sync_sku_pause_flags (
          sku,
          paused
        )
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          paused = VALUES(paused),
          updated_at = NOW()
      `,
      [sku, paused ? 1 : 0]
    );

    return (await this.findBySku(sku))!;
  }

  async bulkUpsert(items: Array<{ sku: string; paused: boolean }>): Promise<SkuPauseFlagRecord[]> {
    if (!items.length) {
      return [];
    }

    const normalized = [...new Map(items.map(item => [item.sku, item])).values()];
    const placeholders = normalized.map(() => '(?, ?)').join(', ');
    const values = normalized.flatMap(item => [item.sku, item.paused ? 1 : 0]);

    await this.entityManager.query(
      `
        INSERT INTO product_sync_sku_pause_flags (
          sku,
          paused
        )
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE
          paused = VALUES(paused),
          updated_at = NOW()
      `,
      values
    );

    const rows = await this.findRowsBySkus(normalized.map(item => item.sku));
    const map = new Map(rows.map(row => [row.sku, row]));

    return normalized.map(item => map.get(item.sku)!).filter(Boolean);
  }

  async findBySku(sku: string): Promise<SkuPauseFlagRecord | null> {
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM product_sync_sku_pause_flags
        WHERE sku = ?
        LIMIT 1
      `,
      [sku]
    );

    if (!rows.length) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async findBySkus(skus: string[]): Promise<Array<{ sku: string; paused: boolean }>> {
    if (!skus.length) {
      return [];
    }

    const normalized = [...new Set(skus)];
    const rows = await this.findRowsBySkus(normalized);
    const map = new Map(rows.map(row => [row.sku, row.paused]));

    return normalized.map(sku => ({
      sku,
      paused: map.get(sku) ?? false
    }));
  }

  async list(filters: ListSkuPauseFlagsFilters): Promise<{
    items: SkuPauseFlagRecord[];
    limit: number;
    offset: number;
    total: number;
    count: number;
    hasNext: boolean;
    nextOffset: number | null;
  }> {
    const where: string[] = [];
    const params: any[] = [];

    if (filters.sku?.trim()) {
      where.push('sku LIKE ?');
      params.push(`%${filters.sku.trim()}%`);
    }

    if (typeof filters.paused === 'boolean') {
      where.push('paused = ?');
      params.push(filters.paused ? 1 : 0);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM product_sync_sku_pause_flags
        ${whereClause}
        ORDER BY sku ASC
        LIMIT ? OFFSET ?
      `,
      [...params, filters.limit, filters.offset]
    );

    const totalRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM product_sync_sku_pause_flags
        ${whereClause}
      `,
      params
    );

    const total = Number(totalRows[0]?.total ?? 0);
    const items = rows.map((row: GenericRow) => this.mapRow(row));
    const hasNext = filters.offset + filters.limit < total;

    return {
      items,
      limit: filters.limit,
      offset: filters.offset,
      total,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? filters.offset + filters.limit : null
    };
  }

  async deleteBySku(sku: string): Promise<boolean> {
    const result: any = await this.entityManager.query(
      `
        DELETE FROM product_sync_sku_pause_flags
        WHERE sku = ?
      `,
      [sku]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  private async findRowsBySkus(skus: string[]): Promise<SkuPauseFlagRecord[]> {
    if (!skus.length) {
      return [];
    }

    const placeholders = skus.map(() => '?').join(', ');
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM product_sync_sku_pause_flags
        WHERE sku IN (${placeholders})
      `,
      skus
    );

    return rows.map((row: GenericRow) => this.mapRow(row));
  }

  private mapRow(row: GenericRow): SkuPauseFlagRecord {
    return {
      id: Number(row.id),
      sku: String(row.sku),
      paused: Boolean(row.paused),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }
}
