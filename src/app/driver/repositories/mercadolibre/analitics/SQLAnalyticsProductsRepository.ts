import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IAnalyticsProductsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsProductsRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLAnalyticsProductsRepository implements IAnalyticsProductsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async getProducts(params: {
    page?: number;
    limit?: number;

    brand?: string;

    minPrice?: number;
    maxPrice?: number;

    minVisits?: number;
    maxVisits?: number;

    minOrders?: number;
    maxOrders?: number;

    orderBy?: 'visits' | 'orders' | 'price';
    direction?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      brand,
      minPrice,
      maxPrice,
      minVisits,
      maxVisits,
      minOrders,
      maxOrders,
      orderBy = 'visits',
      direction = 'desc'
    } = params;

    const safeLimit = Number(limit);
    const safePage = Number(page);
    const offset = (safePage - 1) * safeLimit;

    const where: string[] = [];
    const values: any[] = [];

    /* ================= FILTERS ================= */

    if (brand) {
      where.push(`p.brand = ?`);
      values.push(brand);
    }

    if (minPrice !== undefined) {
      where.push(`p.price >= ?`);
      values.push(minPrice);
    }

    if (maxPrice !== undefined) {
      where.push(`p.price <= ?`);
      values.push(maxPrice);
    }

    if (minOrders !== undefined) {
      where.push(`p.sold_quantity >= ?`);
      values.push(minOrders);
    }

    if (maxOrders !== undefined) {
      where.push(`p.sold_quantity <= ?`);
      values.push(maxOrders);
    }

    if (minVisits !== undefined) {
      where.push(`COALESCE(v.total_visits, 0) >= ?`);
      values.push(minVisits);
    }

    if (maxVisits !== undefined) {
      where.push(`COALESCE(v.total_visits, 0) <= ?`);
      values.push(maxVisits);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const orderMap: Record<string, string> = {
      visits: 'visits',
      orders: 'p.sold_quantity',
      price: 'p.price'
    };

    const orderColumn = orderMap[orderBy] ?? 'visits';
    const orderDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    /* ================= COUNT ================= */

    const countSql = `
      SELECT COUNT(*) as total
      FROM mercadolibre_products p
      LEFT JOIN mercadolibre_item_visits v
        ON v.item_id = p.id
      ${whereClause}
    `;

    const countResult = await this.entityManager.query(countSql, values);

    const total = Number(countResult[0].total);
    const totalPages = Math.ceil(total / safeLimit);

    /* ================= DATA ================= */

    const dataSql = `
      SELECT
        p.id,
        p.title,
        p.thumbnail,
        p.price,
        p.seller_sku,
        p.sold_quantity AS soldQuantity,
        COALESCE(v.total_visits, 0) AS visits

      FROM mercadolibre_products p

      LEFT JOIN mercadolibre_item_visits v
        ON v.item_id = p.id

      ${whereClause}

      ORDER BY ${orderColumn} ${orderDirection}

      LIMIT ?
      OFFSET ?
    `;

    const rows = await this.entityManager.query(dataSql, [...values, safeLimit, offset]);

    return {
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1
      },
      items: rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        thumbnail: r.thumbnail,
        price: Number(r.price),
        seller_sku: r.seller_sku, // 🔥 NUEVO
        soldQuantity: Number(r.soldQuantity),
        visits: Number(r.visits)
      }))
    };
  }
}
