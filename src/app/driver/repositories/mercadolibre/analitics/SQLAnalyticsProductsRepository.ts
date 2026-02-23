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
    excludeMarketplace?: string[];
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
      direction = 'desc',
      excludeMarketplace
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

    /* ================= EXCLUDE MARKETPLACE OPTIMIZADO ================= */

    let excludeJoin = '';
    if (excludeMarketplace?.length) {
      const placeholders = excludeMarketplace.map(() => '?').join(',');

      excludeJoin = `
        LEFT JOIN product_sync_items psi_filter
          ON psi_filter.seller_sku = p.seller_sku
          AND psi_filter.marketplace IN (${placeholders})
          AND psi_filter.is_active = 1
      `;

      values.push(...excludeMarketplace);
      where.push(`psi_filter.seller_sku IS NULL`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const orderMap: Record<string, string> = {
      visits: 'visits',
      orders: 'p.sold_quantity',
      price: 'p.price'
    };

    const orderColumn = orderMap[orderBy] ?? 'visits';
    const orderDirection = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    /* ================= COUNT ================= */

    const countSql = `
      SELECT COUNT(*) as total
      FROM mercadolibre_products p
      LEFT JOIN mercadolibre_item_visits v
        ON v.item_id = p.id
      ${excludeJoin}
      ${whereClause}
    `;

    let total = 0;

    try {
      const countResult = await this.entityManager.query(countSql, values);
      total = Number(countResult[0]?.total ?? 0);
    } catch (error) {
      console.error('🔥 COUNT SQL ERROR:', error);
      throw error;
    }

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
        COALESCE(v.total_visits, 0) AS visits,

        IF(mfp.product_id IS NOT NULL, 1, 0) AS isFavorite,
        IF(psi_active.seller_sku IS NOT NULL, 1, 0) AS isPublished,

        psi_marketplaces.publishedMarketplaces

      FROM mercadolibre_products p

      LEFT JOIN mercadolibre_item_visits v
        ON v.item_id = p.id

      LEFT JOIN marketplace_favorite_products mfp
        ON mfp.product_id = p.id

      LEFT JOIN (
        SELECT DISTINCT seller_sku
        FROM product_sync_items
        WHERE is_active = 1
      ) psi_active
        ON psi_active.seller_sku = p.seller_sku

      LEFT JOIN (
        SELECT
          seller_sku,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'marketplace', marketplace,
              'status', status,
              'price', price,
              'stock', stock,
              'isActive', is_active
            )
          ) AS publishedMarketplaces
        FROM product_sync_items
        WHERE is_active = 1
        GROUP BY seller_sku
      ) psi_marketplaces
        ON psi_marketplaces.seller_sku = p.seller_sku

      ${excludeJoin}
      ${whereClause}

      ORDER BY ${orderColumn} ${orderDirection}

      LIMIT ?
      OFFSET ?
    `;

    let rows: any[] = [];

    try {
      rows = await this.entityManager.query(dataSql, [...values, safeLimit, offset]);
    } catch (error) {
      console.error('🔥 DATA SQL ERROR:', error);
      throw error;
    }

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
        seller_sku: r.seller_sku,
        soldQuantity: Number(r.soldQuantity),
        visits: Number(r.visits),
        isFavorite: Boolean(r.isFavorite),
        isPublished: Boolean(r.isPublished),
        publishedMarketplaces:
          typeof r.publishedMarketplaces === 'string'
            ? JSON.parse(r.publishedMarketplaces)
            : (r.publishedMarketplaces ?? [])
      }))
    };
  }
}
