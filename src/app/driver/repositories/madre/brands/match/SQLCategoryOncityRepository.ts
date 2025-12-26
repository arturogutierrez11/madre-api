import { Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/IBrandMatchRepository';
import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';
import { EntityManager } from 'typeorm';

export class SQLBrandsOncityRepository implements IBrandMatchRepository {
  private readonly logger = new Logger(SQLBrandsOncityRepository.name);

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
        FROM defaultdb.brand_match_oncity
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
      FROM defaultdb.brand_match_oncity;
    `);

    return Number(result[0].total);
  }
}
