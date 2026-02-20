import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IAnalyticsBrandsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsBrandsRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLAnalyticsBrandsRepository implements IAnalyticsBrandsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async getBrands(params: {
    page?: number;
    limit?: number;
    orderBy?: 'orders' | 'visits' | 'products';
    direction?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, orderBy = 'orders', direction = 'desc' } = params;

    const safeLimit = Number(limit);
    const safePage = Number(page);
    const offset = (safePage - 1) * safeLimit;

    const orderMap: Record<string, string> = {
      orders: 'totalOrders',
      visits: 'totalVisits',
      products: 'totalProducts'
    };

    const orderColumn = orderMap[orderBy] ?? 'totalOrders';
    const orderDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    /* ================= COUNT ================= */

    const countSql = `
      SELECT COUNT(DISTINCT brand) as total
      FROM mercadolibre_products
      WHERE brand IS NOT NULL
    `;

    const countResult = await this.entityManager.query(countSql);
    const total = Number(countResult[0].total);
    const totalPages = Math.ceil(total / safeLimit);

    /* ================= DATA ================= */

    const dataSql = `
      SELECT
        p.brand,
        COUNT(DISTINCT p.id) AS totalProducts,
        COALESCE(SUM(p.sold_quantity), 0) AS totalOrders,
        COALESCE(SUM(v.total_visits), 0) AS totalVisits

      FROM mercadolibre_products p

      LEFT JOIN mercadolibre_item_visits v
        ON v.item_id = p.id

      WHERE p.brand IS NOT NULL

      GROUP BY p.brand

      ORDER BY ${orderColumn} ${orderDirection}

      LIMIT ?
      OFFSET ?
    `;

    const rows = await this.entityManager.query(dataSql, [safeLimit, offset]);

    return {
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages
      },
      items: rows.map((r: any) => ({
        brand: r.brand,
        totalProducts: Number(r.totalProducts),
        totalOrders: Number(r.totalOrders),
        totalVisits: Number(r.totalVisits)
      }))
    };
  }
}
