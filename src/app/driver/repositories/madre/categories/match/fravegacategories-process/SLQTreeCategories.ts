import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ISLQTreeCategories } from 'src/core/adapters/repositories/madre/categories/match/fravegaCategoriesProcess/ISLQTreeCategories';

export class SLQTreeCategories implements ISLQTreeCategories {
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
}
