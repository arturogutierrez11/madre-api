import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLCategoriesFravegaRepository } from 'src/core/adapters/repositories/madre/categories/match/fravegaCategoriesProcess/ISQLCategoriesFravegaRepository';
import { EntityManager } from 'typeorm';

export class SQLCategoriesFravegaRepository implements ISQLCategoriesFravegaRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async getCategoriesTree(): Promise<any[]> {
    const rows = await this.productosMadreEntityManager.query(`
    SELECT id, name, parent_id
    FROM defaultdb.fravega_categories
    ORDER BY name ASC
  `);

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        children: []
      });
    }

    for (const row of rows) {
      const node = map.get(row.id);

      if (row.parent_id) {
        const parent = map.get(row.parent_id);

        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getCategoryAttributes(categoryId: string): Promise<any[]> {
    const rows = await this.productosMadreEntityManager.query(
      `
    SELECT
      id,
      name,
      type,
      group_name,
      description,
      required,
      options
    FROM defaultdb.fravega_category_attributes
    WHERE category_id = ?
    ORDER BY group_name, name
    `,
      [categoryId]
    );

    return rows.map(row => {
      let options: any[] = [];

      if (row.options) {
        try {
          options = JSON.parse(row.options);
        } catch {
          options = [];
        }
      }

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        groupName: row.group_name,
        description: row.description,
        required: Boolean(row.required),
        options
      };
    });
  }

  async findByMeliCategoryId(meliCategoryId: string) {
    const result = await this.productosMadreEntityManager.query(
      `
    SELECT
      meli_category_id,
      meli_category_path,
      fravega_category_id,
      fravega_category_path
    FROM defaultdb.meli_fravega_category_match
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
      fravegaCategoryId: result[0].fravega_category_id,
      fravegaCategoryPath: result[0].fravega_category_path
    };
  }

  async existsMeliCategoryMatch(meliCategoryId: string): Promise<boolean> {
    const result = await this.productosMadreEntityManager.query(
      `
    SELECT EXISTS(
      SELECT 1
      FROM defaultdb.meli_fravega_category_match
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
    fravegaCategoryId: string;
    fravegaCategoryPath: string;
  }): Promise<void> {
    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.meli_fravega_category_match
      (
        meli_category_id,
        meli_category_path,
        fravega_category_id,
        fravega_category_path
      )
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      fravega_category_id = VALUES(fravega_category_id),
      fravega_category_path = VALUES(fravega_category_path);
    `,
      [item.meliCategoryId, item.meliCategoryPath, item.fravegaCategoryId, item.fravegaCategoryPath]
    );
  }
  async upsertManyMeliCategoryMatch(
    items: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }[]
  ): Promise<void> {
    if (!items.length) return;

    const values = items.map(i => [i.meliCategoryId, i.meliCategoryPath, i.fravegaCategoryId, i.fravegaCategoryPath]);

    const placeholders = values.map(() => '(?, ?, ?, ?)').join(',');
    const flatValues = values.flat();

    await this.productosMadreEntityManager.query(
      `
    INSERT INTO defaultdb.meli_fravega_category_match
      (
        meli_category_id,
        meli_category_path,
        fravega_category_id,
        fravega_category_path
      )
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      fravega_category_id = VALUES(fravega_category_id),
      fravega_category_path = VALUES(fravega_category_path);
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
      fravega_category_id,
      fravega_category_path
    FROM defaultdb.meli_fravega_category_match
    ORDER BY meli_category_path ASC
    LIMIT ? OFFSET ?;
    `,
      [limit, offset]
    );

    return rows.map(row => ({
      meliCategoryId: row.meli_category_id,
      meliCategoryPath: row.meli_category_path,
      fravegaCategoryId: row.fravega_category_id,
      fravegaCategoryPath: row.fravega_category_path
    }));
  }
}
