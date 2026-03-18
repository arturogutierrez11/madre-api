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
  async findByMeliBrand(meliBrand: string): Promise<{
    id: number;
    meli_brand: string;
    megatone_brand_id: string;
    megatone_brand_name: string;
    confidence: number;
    created_at: Date;
  } | null> {
    const sql = `
    SELECT 
      id,
      meli_brand,
      fravega_brand_id,
      fravega_brand_name,
      confidence,
      created_at
    FROM meli_fravega_match_brand
    WHERE meli_brand = ?
    LIMIT 1
  `;

    const result = await this.entityManager.query(sql, [meliBrand]);

    return result.length ? result[0] : null;
  }
}
