import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/fravegaBrandsMatch/BrandMatchRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLBrandMatchRepository implements ISQLBrandMatchRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async saveMatch(data: { meliBrand: string; fravegaBrandId: string; fravegaBrandName: string; confidence: number }) {
    const sql = `
      INSERT INTO meli_fravega_match_brand
      (meli_brand, fravega_brand_id, fravega_brand_name, confidence)
      VALUES (?, ?, ?, ?)
    `;

    await this.entityManager.query(sql, [data.meliBrand, data.fravegaBrandId, data.fravegaBrandName, data.confidence]);
  }

  async existsByFravegaBrandId(fravegaBrandId: string): Promise<boolean> {
    const sql = `
    SELECT EXISTS(
      SELECT 1
      FROM meli_fravega_match_brand
      WHERE fravega_brand_id = ?
      LIMIT 1
    ) AS existsMatch
  `;

    const result = await this.entityManager.query(sql, [fravegaBrandId]);

    return Boolean(result[0]?.existsMatch);
  }
}
