import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  ISyncStatesRepository,
  SyncState,
  SyncStatus
} from 'src/core/adapters/repositories/mercadolibre/sync/ISyncStatesRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLSyncStatesRepository implements ISyncStatesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async get(params: { processName: string; sellerId: string }): Promise<SyncState | null> {
    const rows = await this.entityManager.query(
      `
      SELECT
        process_name,
        seller_id,
        last_offset,
        status,
        updated_at
      FROM sync_states
      WHERE process_name = ?
        AND seller_id = ?
      LIMIT 1
      `,
      [params.processName, params.sellerId]
    );

    if (!rows.length) return null;

    const row = rows[0];

    return {
      processName: row.process_name,
      sellerId: row.seller_id,
      lastOffset: Number(row.last_offset),
      status: row.status as SyncStatus,
      updatedAt: new Date(row.updated_at)
    };
  }

  async upsert(params: {
    processName: string;
    sellerId: string;
    lastOffset: number;
    status: SyncStatus;
  }): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO sync_states (
        process_name,
        seller_id,
        last_offset,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        last_offset = VALUES(last_offset),
        status = VALUES(status),
        updated_at = NOW()
      `,
      [params.processName, params.sellerId, params.lastOffset, params.status]
    );
  }
}
