import { InjectEntityManager } from '@nestjs/typeorm';
import { ICategoryMatchRepository } from 'src/core/adapters/repositories/madre/categories/match/ICategoryMatchRepository';
import { EntityManager } from 'typeorm';
import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';

export class SQLCategoriesOncityRepository implements ICategoryMatchRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findAllCategoriesMatch(limit = 20, offset = 0): Promise<CategoriesMatchToMarket[]> {
    const results = await this.productosMadreEntityManager.query(
      `
      SELECT
        sku,
        matched_category_id,
        matched_category,
        matched_category_path
      FROM defaultdb.categories_match_oncity
      ORDER BY sku ASC
      LIMIT ? OFFSET ?;
      `,
      [limit, offset]
    );

    return results.map(row => ({
      sku: row.sku,
      categoryId: row.matched_category_id,
      categoryName: row.matched_category,
      categoryPath: row.matched_category_path
    }));
  }

  async countCategoriesMatch(): Promise<number> {
    const result = await this.productosMadreEntityManager.query(`
      SELECT COUNT(*) AS total
      FROM defaultdb.categories_match_oncity;
    `);

    return Number(result[0].total);
  }
}
