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
  async upsertCategoryMatch(item: CategoriesMatchToMarket): Promise<void> {
    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.categories_match_oncity
      (sku, matched_category_id, matched_category, matched_category_path)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      matched_category_id = VALUES(matched_category_id),
      matched_category = VALUES(matched_category),
      matched_category_path = VALUES(matched_category_path);
    `,
      [item.sku, item.categoryId, item.categoryName, item.categoryPath]
    );
  }
  async upsertManyCategoryMatch(items: CategoriesMatchToMarket[]): Promise<void> {
    if (!items.length) return;

    const values = items.map(item => [item.sku, item.categoryId, item.categoryName, item.categoryPath]);

    const placeholders = values.map(() => '(?, ?, ?, ?)').join(',');
    const flatValues = values.flat();

    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.categories_match_oncity
      (sku, matched_category_id, matched_category, matched_category_path)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      matched_category_id = VALUES(matched_category_id),
      matched_category = VALUES(matched_category),
      matched_category_path = VALUES(matched_category_path);
    `,
      flatValues
    );
  }
  async existsSkuCategoryMatch(sku: string): Promise<boolean> {
    const result = await this.productosMadreEntityManager.query(
      `
    SELECT EXISTS(
      SELECT 1
      FROM defaultdb.categories_match_oncity
      WHERE sku = ?
      LIMIT 1
    ) AS exists_match;
    `,
      [sku]
    );

    return Number(result[0].exists_match) === 1;
  }
}
