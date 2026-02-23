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

    /* ================= EXCLUDE MARKETPLACE ================= */

    if (excludeMarketplace?.length) {
      const placeholders = excludeMarketplace.map(() => '?').join(',');

      where.push(`
      NOT EXISTS (
        SELECT 1
        FROM product_sync_items psi
        WHERE psi.seller_sku = p.seller_sku
          AND psi.marketplace IN (${placeholders})
          AND psi.is_active = 1
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
    const orderDirection = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    /* ================= COUNT (LIVIANO) ================= */

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

    /* ================= DATA PAGINADA (SIN JSON) ================= */

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

    if (!rows.length) {
      return {
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        },
        items: []
      };
    }

    /* ================= TRAER FAVORITOS SOLO PARA ESTOS ================= */

    const productIds = rows.map((r: any) => r.id);
    const skuList = rows.map((r: any) => r.seller_sku);

    const placeholdersIds = productIds.map(() => '?').join(',');
    const placeholdersSku = skuList.map(() => '?').join(',');

    const favorites = await this.entityManager.query(
      `
      SELECT product_id
      FROM marketplace_favorite_products
      WHERE product_id IN (${placeholdersIds})
    `,
      productIds
    );

    const published = await this.entityManager.query(
      `
      SELECT DISTINCT seller_sku
      FROM product_sync_items
      WHERE is_active = 1
        AND seller_sku IN (${placeholdersSku})
    `,
      skuList
    );

    const marketplaces = await this.entityManager.query(
      `
      SELECT
        seller_sku,
        marketplace,
        status,
        price,
        stock,
        is_active
      FROM product_sync_items
      WHERE is_active = 1
        AND seller_sku IN (${placeholdersSku})
    `,
      skuList
    );

    const favoriteSet = new Set(favorites.map((f: any) => f.product_id));
    const publishedSet = new Set(published.map((p: any) => p.seller_sku));

    const marketplaceMap = new Map<string, any[]>();

    for (const m of marketplaces) {
      if (!marketplaceMap.has(m.seller_sku)) {
        marketplaceMap.set(m.seller_sku, []);
      }

      marketplaceMap.get(m.seller_sku)!.push({
        marketplace: m.marketplace,
        status: m.status,
        price: Number(m.price),
        stock: Number(m.stock),
        isActive: Number(m.is_active)
      });
    }

    /* ================= RESPONSE FINAL ================= */

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
        isFavorite: favoriteSet.has(r.id),
        isPublished: publishedSet.has(r.seller_sku),
        publishedMarketplaces: marketplaceMap.get(r.seller_sku) ?? []
      }))
    };
  }
}
