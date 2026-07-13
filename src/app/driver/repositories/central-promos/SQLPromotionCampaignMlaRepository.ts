import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  IPromotionCampaignMlaRepository,
  PromotionCampaignMlaExistsResult,
  PromotionCampaignMlaRow
} from 'src/core/adapters/repositories/central-promos/IPromotionCampaignMlaRepository';

@Injectable()
export class SQLPromotionCampaignMlaRepository implements IPromotionCampaignMlaRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(mla: string): Promise<PromotionCampaignMlaRow> {
    const normalizedMla = this.normalizeMla(mla);

    await this.entityManager.query(
      `
        INSERT INTO promotion_campaign_mlas (mla)
        VALUES (?)
        ON DUPLICATE KEY UPDATE
          updated_at = CURRENT_TIMESTAMP
      `,
      [normalizedMla]
    );

    const rows: PromotionCampaignMlaRow[] = await this.entityManager.query(
      `
        SELECT id, mla, created_at, updated_at
        FROM promotion_campaign_mlas
        WHERE mla = ?
        LIMIT 1
      `,
      [normalizedMla]
    );

    return rows[0];
  }

  async createBulk(mlas: string[]): Promise<number> {
    const normalizedMlas = this.normalizeMlas(mlas);

    if (!normalizedMlas.length) {
      return 0;
    }

    const placeholders = normalizedMlas.map(() => '(?)').join(', ');

    const result: any = await this.entityManager.query(
      `
        INSERT INTO promotion_campaign_mlas (mla)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE
          updated_at = CURRENT_TIMESTAMP
      `,
      normalizedMlas
    );

    return Number(result.affectedRows ?? 0);
  }

  async checkExistsBulk(mlas: string[]): Promise<PromotionCampaignMlaExistsResult[]> {
    const normalizedMlas = this.normalizeMlas(mlas);

    if (!normalizedMlas.length) {
      return [];
    }

    const placeholders = normalizedMlas.map(() => '?').join(', ');

    const rows: Array<{ mla: string }> = await this.entityManager.query(
      `
        SELECT mla
        FROM promotion_campaign_mlas
        WHERE mla IN (${placeholders})
      `,
      normalizedMlas
    );

    const existing = new Set(rows.map(row => row.mla));

    return normalizedMlas.map(mla => ({
      mla,
      exists: existing.has(mla)
    }));
  }

  async list(limit: number, offset: number): Promise<PromotionCampaignMlaRow[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const rows: PromotionCampaignMlaRow[] = await this.entityManager.query(
      `
        SELECT id, mla, created_at, updated_at
        FROM promotion_campaign_mlas
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [safeLimit, safeOffset]
    );

    return rows;
  }

  async count(): Promise<number> {
    const rows: Array<{ total: number | string }> = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM promotion_campaign_mlas
      `
    );

    return Number(rows[0]?.total ?? 0);
  }

  private normalizeMla(mla: string): string {
    return String(mla ?? '').trim().toUpperCase();
  }

  private normalizeMlas(mlas: string[]): string[] {
    return [...new Set(
      (mlas ?? [])
        .map(mla => this.normalizeMla(mla))
        .filter(Boolean)
    )];
  }
}
