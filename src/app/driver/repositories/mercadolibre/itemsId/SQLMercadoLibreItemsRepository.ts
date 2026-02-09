import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLMercadoLibreItemsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsId/ISQLMercadoLibreItemsRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { EntityManager } from 'typeorm';

const BULK_INSERT_BATCH_SIZE = 1000;

@Injectable()
export class SQLMercadoLibreItemsRepository implements ISQLMercadoLibreItemsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async insertBulkItems(params: { sellerId: string; items: string[]; status: string }): Promise<number> {
    const { sellerId, items, status } = params;

    if (items.length === 0) {
      return 0;
    }

    let totalInserted = 0;

    for (let i = 0; i < items.length; i += BULK_INSERT_BATCH_SIZE) {
      const batch = items.slice(i, i + BULK_INSERT_BATCH_SIZE);
      const inserted = await this.executeBulkInsert(sellerId, batch, status);
      totalInserted += inserted;
    }

    return totalInserted;
  }

  private async executeBulkInsert(sellerId: string, items: string[], status: string): Promise<number> {
    const values = items.map(itemId => `('${itemId}', '${sellerId}', '${status}', NOW(), NOW())`).join(',');

    const sql = `
      INSERT INTO mercadolibre_items (
        item_id,
        seller_id,
        status,
        created_at,
        updated_at
      )
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = NOW()
    `;

    const result = await this.entityManager.query(sql);
    return result.affectedRows || 0;
  }

  async findAll(
    { limit, offset }: PaginationParams,
    filters?: { sellerId?: string; status?: string }
  ): Promise<PaginatedResult<string>> {
    const where: string[] = [];
    const params: any[] = [];

    if (filters?.sellerId) {
      where.push('seller_id = ?');
      params.push(filters.sellerId);
    }

    if (filters?.status) {
      where.push('status = ?');
      params.push(filters.status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await this.entityManager.query(
      `
      SELECT item_id
      FROM mercadolibre_items
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset]
    );

    const countResult = await this.entityManager.query(
      `
      SELECT COUNT(*) AS total
      FROM mercadolibre_items
      ${whereClause}
    `,
      params
    );

    const total = Number(countResult[0].total);
    const hasNext = offset + limit < total;

    return {
      items: rows.map((r: any) => r.item_id),
      total,
      limit,
      offset,
      count: rows.length,
      hasNext,
      nextOffset: hasNext ? offset + limit : null
    };
  }
}
