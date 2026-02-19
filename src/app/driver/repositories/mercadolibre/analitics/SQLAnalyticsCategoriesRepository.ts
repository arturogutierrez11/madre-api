import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IAnalyticsCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsCategoriesRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLAnalyticsCategoriesRepository implements IAnalyticsCategoriesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}
  async getCategoriesPerformance(params: {
    sellerId: string;
    categoryIds?: string[];
    orderBy?: 'visits' | 'orders' | 'conversion' | 'revenue';
    direction?: 'asc' | 'desc';
  }) {
    const { sellerId, categoryIds, orderBy = 'visits', direction = 'desc' } = params;

    const where: string[] = [];
    const values: any[] = [];

    // 🔐 siempre filtrar por seller
    where.push('p.seller_id = ?');
    values.push(sellerId);

    if (categoryIds?.length) {
      const placeholders = categoryIds.map(() => '?').join(',');
      where.push(`p.category_id IN (${placeholders})`);
      values.push(...categoryIds);
    }

    const orderMap: Record<string, string> = {
      visits: 'visits',
      orders: 'orders',
      revenue: 'revenue',
      conversion: 'conversionRate'
    };

    const orderColumn = orderMap[orderBy] ?? 'visits';
    const orderDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
    SELECT
      p.category_id AS categoryId,

      COUNT(DISTINCT p.id) AS totalProducts,

      COALESCE(SUM(v.total_visits), 0) AS visits,
      COALESCE(SUM(p.sold_quantity), 0) AS orders,
      COALESCE(SUM(p.price * p.sold_quantity), 0) AS revenue,

      CASE 
        WHEN SUM(p.sold_quantity) > 0
        THEN SUM(p.price * p.sold_quantity) / SUM(p.sold_quantity)
        ELSE 0
      END AS avgTicket,

      CASE
        WHEN SUM(v.total_visits) > 0
        THEN (SUM(p.sold_quantity) / SUM(v.total_visits)) * 100
        ELSE 0
      END AS conversionRate

    FROM mercadolibre_products p
    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}

    GROUP BY p.category_id
    ORDER BY ${orderColumn} ${orderDirection}
  `;

    const rows = await this.entityManager.query(sql, values);

    return rows.map((r: any) => ({
      categoryId: r.categoryId,
      totalProducts: Number(r.totalProducts),
      visits: Number(r.visits),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
      avgTicket: Number(r.avgTicket),
      conversionRate: Number(r.conversionRate)
    }));
  }

  async getAvailableCategories(): Promise<{ id: string; name: string }[]> {
    const sql = `
    SELECT DISTINCT
      c.id,
      c.name
    FROM mercadolibre_products p
    INNER JOIN mercadolibre_categories c
      ON c.id = p.category_id
    ORDER BY c.name ASC
  `;

    const rows = await this.entityManager.query(sql);

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name
    }));
  }
}
