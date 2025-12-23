import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { IBrandsMadreRepository } from 'src/core/adapters/repositories/brands/madre/IBrandsMadreRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';

export class SQLBrandsRepository implements IBrandsMadreRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findBrandsFromMadreDB(pagination: PaginationParams): Promise<PaginatedResult<string>> {
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);

    const items = await this.productosMadreEntityManager.query(
      `
      SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(atributos, '$.marca')) AS marca
      FROM defaultdb.productos_madre
      WHERE JSON_EXTRACT(atributos, '$.marca') IS NOT NULL
        AND JSON_UNQUOTE(JSON_EXTRACT(atributos, '$.marca')) <> ''
      ORDER BY marca ASC
      LIMIT ? OFFSET ?;
      `,
      [limit, offset]
    );

    const countResult = await this.productosMadreEntityManager.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(atributos, '$.marca')) AS marca
        FROM defaultdb.productos_madre
        WHERE JSON_EXTRACT(atributos, '$.marca') IS NOT NULL
          AND JSON_UNQUOTE(JSON_EXTRACT(atributos, '$.marca')) <> ''
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
      items: items.map(i => i.marca)
    };
  }
}
