import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { ICategoriesMadreRepository } from 'src/core/adapters/repositories/madre/categories/ICategoriesMadreRepository';
import { CategoryMadre } from 'src/core/entities/madre/categories/CategoryMadre';

export class SQLCategoriesRepository implements ICategoriesMadreRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findCategoriesFromMadreDB(pagination: PaginationParams): Promise<PaginatedResult<CategoryMadre>> {
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);

    const items = await this.productosMadreEntityManager.query(
      `
      SELECT
        MIN(id)  AS id,
        MIN(sku) AS sku,
        categoria AS category
      FROM defaultdb.productos_madre
      WHERE categoria IS NOT NULL
        AND categoria <> ''
      GROUP BY categoria
      ORDER BY category ASC
      LIMIT ? OFFSET ?;
      `,
      [limit, offset]
    );

    const countResult = await this.productosMadreEntityManager.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT categoria
        FROM defaultdb.productos_madre
        WHERE categoria IS NOT NULL
          AND categoria <> ''
        GROUP BY categoria
      ) AS subquery;
      `
    );

    const total = Number(countResult[0].total);
    const nextOffset = offset + limit;
    const hasNext = nextOffset < total;

    return {
      total,
      limit,
      offset,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? nextOffset : null,
      items
    };
  }
}
