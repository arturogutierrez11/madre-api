import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLAnalyticsCacheCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/categories/ISQLAnalyticsCacheCategoriesRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLAnalyticsCacheCategoriesRepository implements ISQLAnalyticsCacheCategoriesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async getCurrentVersion(): Promise<number> {
    const result = await this.entityManager.query(
      `SELECT current_version FROM analytics_metadata WHERE id = 1 LIMIT 1`
    );

    return Number(result[0]?.current_version ?? 1);
  }

  async getByKey<T>(cacheKey: string, version: number): Promise<T | null> {
    const result = await this.entityManager.query(
      `
      SELECT response_json
      FROM analytics_cache
      WHERE cache_key = ?
        AND data_version = ?
      LIMIT 1
      `,
      [cacheKey, version]
    );

    if (!result.length) return null;

    return JSON.parse(result[0].response_json);
  }

  async save<T>(cacheKey: string, version: number, data: T): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO analytics_cache
        (cache_key, data_version, response_json)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        response_json = VALUES(response_json),
        created_at = CURRENT_TIMESTAMP
      `,
      [cacheKey, version, JSON.stringify(data)]
    );
  }

  async incrementVersion(): Promise<void> {
    await this.entityManager.query(
      `
      UPDATE analytics_metadata
      SET current_version = current_version + 1
      WHERE id = 1
      `
    );
  }

  
}
