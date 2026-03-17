import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';
import { ISQLCategoriesMegatoneRepository } from 'src/core/adapters/repositories/madre/categories/match/megatoneCategoriesProcess/ISQLCategoriesMegatoneRepository';

export class SQLCategoriesMegatoneRepository implements ISQLCategoriesMegatoneRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findByMeliCategoryId(meliCategoryId: string) {
    const result = await this.productosMadreEntityManager.query(
      `
    SELECT
      meli_category_id,
      meli_category_path,
      megatone_category_id,
      megatone_category_path
    FROM defaultdb.meli_megatone_category_match
    WHERE meli_category_id = ?
    LIMIT 1;
    `,
      [meliCategoryId]
    );

    if (!result.length) {
      return null;
    }

    return {
      meliCategoryId: result[0].meli_category_id,
      meliCategoryPath: result[0].meli_category_path,
      megatoneCategoryId: result[0].megatone_category_id,
      megatoneCategoryPath: result[0].megatone_category_path
    };
  }
  async existsMeliCategoryMatch(meliCategoryId: string): Promise<boolean> {
    const result = await this.productosMadreEntityManager.query(
      `
    SELECT EXISTS(
      SELECT 1
      FROM defaultdb.meli_megatone_category_match
      WHERE meli_category_id = ?
      LIMIT 1
    ) AS exists_match;
    `,
      [meliCategoryId]
    );

    return Number(result[0].exists_match) === 1;
  }

  async upsertMeliCategoryMatch(item: {
    meliCategoryId: string;
    meliCategoryPath: string;
    megatoneCategoryId: string;
    megatoneCategoryPath: string;
  }): Promise<void> {
    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.meli_megatone_category_match
      (
        meli_category_id,
        meli_category_path,
        megatone_category_id,
        megatone_category_path
      )
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      megatone_category_id = VALUES(megatone_category_id),
      megatone_category_path = VALUES(megatone_category_path);
    `,
      [item.meliCategoryId, item.meliCategoryPath, item.megatoneCategoryId, item.megatoneCategoryPath]
    );
  }

  async upsertManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      megatoneCategoryId: string;
      megatoneCategoryPath: string;
    }[]
  ): Promise<void> {
    if (!items.length) return;

    const values = items.map(i => [i.meliCategoryId, i.meliCategoryPath, i.megatoneCategoryId, i.megatoneCategoryPath]);

    const placeholders = values.map(() => '(?, ?, ?, ?)').join(',');
    const flatValues = values.flat();

    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.meli_megatone_category_match
      (
        meli_category_id,
        meli_category_path,
        megatone_category_id,
        megatone_category_path
      )
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      megatone_category_id = VALUES(megatone_category_id),
      megatone_category_path = VALUES(megatone_category_path);
    `,
      flatValues
    );
  }

  async findAllMeliCategoryMatches(limit = 100, offset = 0) {
    const rows = await this.productosMadreEntityManager.query(
      `
    SELECT
      meli_category_id,
      meli_category_path,
      megatone_category_id,
      megatone_category_path
    FROM defaultdb.meli_megatone_category_match
    ORDER BY meli_category_path ASC
    LIMIT ? OFFSET ?;
    `,
      [limit, offset]
    );

    return rows.map(row => ({
      meliCategoryId: row.meli_category_id,
      meliCategoryPath: row.meli_category_path,
      megatoneCategoryId: row.megatone_category_id,
      megatoneCategoryPath: row.megatone_category_path
    }));
  }
}
