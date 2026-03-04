import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { IBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/IBrandMatchRepository';
import { Logger } from '@nestjs/common';
import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';

export class SQLBrandsFravegaRepository implements IBrandMatchRepository {
  private readonly logger = new Logger(SQLBrandsFravegaRepository.name);

  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findAllBrandsMatch(limit = 20, offset = 0): Promise<BrandsMatchtoMarket[]> {
    try {
      const results = await this.productosMadreEntityManager.query(
        `
        SELECT 
          sku,
          brand_id,
          brand_name
        FROM defaultdb.brand_match_fravega
        ORDER BY sku ASC
        LIMIT ? OFFSET ?;
        `,
        [limit, offset]
      );

      return results.map(row => ({
        sku: row.sku,
        brandId: row.brand_id,
        brandName: row.brand_name
      }));
    } catch (error) {
      this.logger.error('Database query failed while fetching brands match', error.stack);
      return [];
    }
  }

  async countBrandsMatch(): Promise<number> {
    const result = await this.productosMadreEntityManager.query(`
      SELECT COUNT(*) AS total
      FROM defaultdb.brand_match_fravega;
    `);

    return Number(result[0].total);
  }

  async upsertBrandMatch(item: BrandsMatchtoMarket): Promise<void> {
    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.brand_match_fravega (sku, brand_id, brand_name)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      brand_id = VALUES(brand_id),
      brand_name = VALUES(brand_name);
    `,
      [item.sku, item.brandId, item.brandName]
    );
  }
  async upsertManyBrandMatch(items: BrandsMatchtoMarket[]): Promise<void> {
    if (!items.length) return;

    const values = items.map(item => [item.sku, item.brandId, item.brandName]);

    const placeholders = values.map(() => '(?, ?, ?)').join(',');

    const flatValues = values.flat();

    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.brand_match_fravega (sku, brand_id, brand_name)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      brand_id = VALUES(brand_id),
      brand_name = VALUES(brand_name);
    `,
      flatValues
    );
  }
}
