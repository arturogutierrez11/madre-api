import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLMercadoLibreItemVisitsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsVisits/ISQLMercadoLibreItemVisitsRepository';
import { MercadoLibreItemVisit } from 'src/core/entities/mercadolibre/itemsVisits/MercadoLibreItemVisit';
import { PaginatedResult } from 'src/core/entities/mercadolibre/itemsVisits/PaginatedResult';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLMercadoLibreItemVisitsRepository implements ISQLMercadoLibreItemVisitsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  // ─────────────────────────────────────────────
  // UPSERT
  // ─────────────────────────────────────────────
  async upsert(params: { itemId: string; totalVisits: number }): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO mercadolibre_item_visits (
        item_id,
        total_visits
      )
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        total_visits = VALUES(total_visits),
        updated_at = CURRENT_TIMESTAMP
      `,
      [params.itemId, params.totalVisits]
    );
  }

  // ─────────────────────────────────────────────
  // GET ONE
  // ─────────────────────────────────────────────
  async findByItemId(itemId: string): Promise<MercadoLibreItemVisit | null> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_item_visits
      WHERE item_id = ?
      LIMIT 1
      `,
      [itemId]
    );

    if (!rows.length) return null;

    const row = rows[0];

    return {
      itemId: row.item_id,
      totalVisits: row.total_visits,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ─────────────────────────────────────────────
  // PAGINATED
  // ─────────────────────────────────────────────
  async findAll({ limit, offset }: { limit: number; offset: number }): Promise<PaginatedResult<MercadoLibreItemVisit>> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_item_visits
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const countResult = await this.entityManager.query(
      `
      SELECT COUNT(*) AS total
      FROM mercadolibre_item_visits
      `
    );

    const total = Number(countResult[0].total);
    const hasNext = offset + limit < total;

    return {
      items: rows.map((row: any) => ({
        itemId: row.item_id,
        totalVisits: row.total_visits,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      total,
      limit,
      offset,
      count: rows.length,
      hasNext,
      nextOffset: hasNext ? offset + limit : null
    };
  }
}
