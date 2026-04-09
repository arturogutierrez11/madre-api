import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IProductDeltaCursorRepository } from 'src/core/adapters/repositories/product-delta/IProductDeltaCursorRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLProductDeltaCursorRepository implements IProductDeltaCursorRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async getCursor(syncKey: string): Promise<number> {
    const rows = await this.entityManager.query(
      `
      SELECT last_delta_id
      FROM delta_sync_cursor
      WHERE sync_key = ?
      LIMIT 1
      `,
      [syncKey]
    );

    if (!rows.length) return 0;

    return Number(rows[0].last_delta_id);
  }

  async updateCursor(syncKey: string, lastDeltaId: number): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO delta_sync_cursor (sync_key, last_delta_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        last_delta_id = IF(VALUES(last_delta_id) > last_delta_id, VALUES(last_delta_id), last_delta_id)
      `,
      [syncKey, lastDeltaId]
    );
  }
}
