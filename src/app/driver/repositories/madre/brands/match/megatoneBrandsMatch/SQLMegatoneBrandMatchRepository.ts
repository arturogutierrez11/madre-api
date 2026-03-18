import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLMegatoneBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/megatoneBrandsMatch/ISQLMegatoneBrandMatchRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLMegatoneBrandMatchRepository implements ISQLMegatoneBrandMatchRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async saveMatch(data: { meliBrand: string; megatoneBrandId: string; megatoneBrandName: string; confidence: number }) {
    const sql = `
      INSERT INTO meli_megatone_match_brand
      (meli_brand, megatone_brand_id, megatone_brand_name, confidence)
      VALUES (?, ?, ?, ?)
    `;

    await this.entityManager.query(sql, [
      data.meliBrand,
      data.megatoneBrandId,
      data.megatoneBrandName,
      data.confidence
    ]);
  }

  async existsByMegatoneBrandId(megatoneBrandId: string): Promise<boolean> {
    const sql = `
      SELECT EXISTS(
        SELECT 1
        FROM meli_megatone_match_brand
        WHERE megatone_brand_id = ?
        LIMIT 1
      ) AS existsMatch
    `;

    const result = await this.entityManager.query(sql, [megatoneBrandId]);

    return Boolean(result[0]?.existsMatch);
  }
}
