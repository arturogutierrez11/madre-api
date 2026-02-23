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

    excludeMarketplace?: string[]; // 👈 NUEVO
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

    /* ================= EXCLUIR MARKETPLACES ================= */

    if (excludeMarketplace?.length) {
      const placeholders = excludeMarketplace.map(() => '?').join(',');

      where.push(`
      NOT EXISTS (
        SELECT 1
        FROM product_sync_items psi_filter
        WHERE psi_filter.seller_sku COLLATE utf8mb4_unicode_ci
              = p.seller_sku COLLATE utf8mb4_unicode_ci
          AND psi_filter.marketplace IN (${placeholders})
          AND psi_filter.is_active = 1
      )
    `);

      values.push(...excludeMarketplace);
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

    const total = Number(countResult[0]?.total ?? 0);
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

      /* FAVORITOS */
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM marketplace_favorite_products mfp
          WHERE mfp.product_id = p.id
        )
        THEN 1 ELSE 0
      END AS isFavorite,

      /* PUBLICADOS */
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM product_sync_items psi
          WHERE psi.seller_sku COLLATE utf8mb4_unicode_ci
                = p.seller_sku COLLATE utf8mb4_unicode_ci
            AND psi.is_active = 1
        )
        THEN 1 ELSE 0
      END AS isPublished,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'marketplace', psi.marketplace,
            'status', psi.status,
            'price', psi.price,
            'stock', psi.stock,
            'isActive', psi.is_active
          )
        )
        FROM product_sync_items psi
        WHERE psi.seller_sku COLLATE utf8mb4_unicode_ci
              = p.seller_sku COLLATE utf8mb4_unicode_ci
          AND psi.is_active = 1
      ) AS publishedMarketplaces

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
