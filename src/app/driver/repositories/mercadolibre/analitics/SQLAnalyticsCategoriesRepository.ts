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
    orderBy?: 'visits' | 'orders' | 'conversion' | 'revenue' | 'products';
    direction?: 'asc' | 'desc';
  }) {
    const { sellerId, categoryIds, orderBy = 'visits', direction = 'desc' } = params;

    const where: string[] = [];
    const values: any[] = [];

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
      conversion: 'conversionRate',
      products: 'totalProducts'
    };

    const orderColumn = orderMap[orderBy] ?? 'visits';
    const orderDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
    SELECT
      p.category_id AS categoryId,
      c.name AS categoryName,

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

    INNER JOIN mercadolibre_categories c
      ON c.id = p.category_id

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}

    GROUP BY p.category_id, c.name

    ORDER BY ${orderColumn} ${orderDirection}
  `;

    const rows = await this.entityManager.query(sql, values);

    return rows.map((r: any) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
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

  // ─────────────────────────────────────────────
  // PARENT CATEGORIES PERFORMANCE (Executive View)
  // ─────────────────────────────────────────────
  async getParentCategoriesPerformance(params: {
    sellerId: string;
    orderBy?: 'visits' | 'orders' | 'revenue' | 'products';
    direction?: 'asc' | 'desc';
  }) {
    const { sellerId, orderBy = 'visits', direction = 'desc' } = params;

    const orderMap: Record<string, string> = {
      visits: 'visits',
      orders: 'orders',
      revenue: 'revenue',
      products: 'totalProducts'
    };

    const orderColumn = orderMap[orderBy] ?? 'visits';
    const orderDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
    SELECT
      parent.id AS categoryId,
      parent.name AS categoryName,

      COUNT(DISTINCT p.id) AS totalProducts,

      COALESCE(SUM(v.total_visits), 0) AS visits,
      COALESCE(SUM(p.sold_quantity), 0) AS orders,
      COALESCE(SUM(p.price * p.sold_quantity), 0) AS revenue

    FROM mercadolibre_categories parent

    JOIN mercadolibre_categories child
      ON child.path LIKE CONCAT(parent.id, '%')

    JOIN mercadolibre_products p
      ON p.category_id = child.id

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    WHERE parent.parent_id IS NULL
      AND p.seller_id = ?

    GROUP BY parent.id, parent.name

    ORDER BY ${orderColumn} ${orderDirection}
  `;

    const rows = await this.entityManager.query(sql, [sellerId]);

    return rows.map((r: any) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      totalProducts: Number(r.totalProducts),
      visits: Number(r.visits),
      orders: Number(r.orders),
      revenue: Number(r.revenue)
    }));
  }

  // ─────────────────────────────────────────────
  // CHILDREN PERFORMANCE (Hierarchical + Summary)
  // ─────────────────────────────────────────────
  async getChildrenPerformance(params: { sellerId: string; parentId: string | null }) {
    const { sellerId, parentId } = params;

    const values: any[] = [sellerId];

    let parentFilter = '';
    let summaryFilter = '';

    if (parentId) {
      parentFilter = 'AND parent.parent_id = ?';
      values.push(parentId);

      summaryFilter = `
      child.path LIKE CONCAT(
        (SELECT path FROM mercadolibre_categories WHERE id = ?),
        '%'
      )
    `;
    } else {
      parentFilter = 'AND parent.parent_id IS NULL';
      summaryFilter = 'parent.parent_id IS NULL';
    }

    // =========================
    // 1️⃣ HIJOS DIRECTOS
    // =========================
    const itemsSql = `
    SELECT
      parent.id AS categoryId,
      parent.name AS categoryName,
      parent.level,

      COUNT(DISTINCT p.id) AS totalProducts,
      COALESCE(SUM(v.total_visits), 0) AS visits,
      COALESCE(SUM(p.sold_quantity), 0) AS orders,
      COALESCE(SUM(p.price * p.sold_quantity), 0) AS revenue

    FROM mercadolibre_categories parent

    LEFT JOIN mercadolibre_categories child
      ON child.path LIKE CONCAT(parent.path, '%')

    LEFT JOIN mercadolibre_products p
      ON p.category_id = child.id
      AND p.seller_id = ?

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    WHERE 1=1
      ${parentFilter}

    GROUP BY parent.id, parent.name, parent.level
    ORDER BY visits DESC
  `;

    const itemsRows = await this.entityManager.query(itemsSql, parentId ? values : [sellerId]);

    // =========================
    // 2️⃣ SUMMARY DE LA RAMA
    // =========================
    const summarySql = `
    SELECT
      COUNT(DISTINCT p.id) AS totalProducts,
      COALESCE(SUM(v.total_visits), 0) AS totalVisits,
      COALESCE(SUM(p.sold_quantity), 0) AS totalOrders,
      COALESCE(SUM(p.price * p.sold_quantity), 0) AS totalRevenue

    FROM mercadolibre_categories child

    LEFT JOIN mercadolibre_products p
      ON p.category_id = child.id
      AND p.seller_id = ?

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    WHERE ${summaryFilter}
  `;

    const summaryValues = parentId ? [sellerId, parentId] : [sellerId];

    const summaryRow = await this.entityManager.query(summarySql, summaryValues);

    const summary = summaryRow[0] || {
      totalProducts: 0,
      totalVisits: 0,
      totalOrders: 0,
      totalRevenue: 0
    };

    return {
      summary: {
        totalProducts: Number(summary.totalProducts),
        totalVisits: Number(summary.totalVisits),
        totalOrders: Number(summary.totalOrders),
        totalRevenue: Number(summary.totalRevenue)
      },
      items: itemsRows.map((r: any) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        level: Number(r.level),
        totalProducts: Number(r.totalProducts),
        visits: Number(r.visits),
        orders: Number(r.orders),
        revenue: Number(r.revenue)
      }))
    };
  }
  async getCategoryProducts(params: {
    categoryId: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    minVisits?: number;
    maxVisits?: number;
    minOrders?: number;
    maxOrders?: number;
    minRevenue?: number;
    maxRevenue?: number;
  }) {
    const {
      categoryId,
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      minVisits,
      maxVisits,
      minOrders,
      maxOrders,
      minRevenue,
      maxRevenue
    } = params;

    const offset = (page - 1) * limit;

    /* ================= WHERE DINÁMICO ================= */

    const where: string[] = [];
    const values: any[] = [];

    // Categoría + subcategorías
    where.push(`
    p.category_id IN (
      SELECT c.id
      FROM mercadolibre_categories c
      WHERE c.path LIKE CONCAT(
        (SELECT path FROM mercadolibre_categories WHERE id = ?),
        '%'
      )
    )
  `);
    values.push(categoryId);

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

    if (minRevenue !== undefined) {
      where.push(`(p.price * p.sold_quantity) >= ?`);
      values.push(minRevenue);
    }

    if (maxRevenue !== undefined) {
      where.push(`(p.price * p.sold_quantity) <= ?`);
      values.push(maxRevenue);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    /* ================= COUNT ================= */

    const countSql = `
    SELECT COUNT(*) as total
    FROM mercadolibre_products p

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    /* EXCLUIR PUBLICADOS */
    LEFT JOIN (
      SELECT seller_sku
      FROM product_sync_items
      GROUP BY seller_sku
    ) psi
      ON psi.seller_sku COLLATE utf8mb4_unicode_ci
         = p.seller_sku COLLATE utf8mb4_unicode_ci

    ${whereClause}
    ${whereClause ? 'AND' : 'WHERE'} psi.seller_sku IS NULL
  `;

    const countResult = await this.entityManager.query(countSql, values);
    const total = Number(countResult[0].total);
    const totalPages = Math.ceil(total / limit);

    /* ================= DATA ================= */

    const dataSql = `
  SELECT
    p.id,
    p.title,
    p.thumbnail,
    p.price,
    p.sold_quantity AS soldQuantity,
    p.seller_sku,
    COALESCE(v.total_visits, 0) AS visits,
    (p.price * p.sold_quantity) AS revenue,

    CASE
      WHEN sp.product_id IS NULL THEN 0
      ELSE 1
    END AS isFavorite

  FROM mercadolibre_products p

  LEFT JOIN mercadolibre_item_visits v
    ON v.item_id = p.id

  /* EXCLUIR PUBLICADOS */
  LEFT JOIN (
    SELECT seller_sku
    FROM product_sync_items
    GROUP BY seller_sku
  ) psi
    ON psi.seller_sku COLLATE utf8mb4_unicode_ci
       = p.seller_sku COLLATE utf8mb4_unicode_ci

  /* FAVORITOS */
  LEFT JOIN favorite_products sp
    ON sp.product_id = p.id

  ${whereClause}
  ${whereClause ? 'AND' : 'WHERE'} psi.seller_sku IS NULL

  ORDER BY revenue DESC

  LIMIT ?
  OFFSET ?
`;

    const rows = await this.entityManager.query(dataSql, [...values, limit, offset]);

    const items = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      thumbnail: r.thumbnail,
      seller_sku: r.seller_sku,
      price: Number(r.price),
      soldQuantity: Number(r.soldQuantity),
      visits: Number(r.visits),
      revenue: Number(r.revenue),
      isFavorite: Boolean(r.isFavorite)
    }));

    return {
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      items
    };
  }
  async addFavorite(productId: string, sellerSku: string) {
    const sql = `
    INSERT INTO favorite_products (product_id, seller_sku)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE seller_sku = VALUES(seller_sku)
  `;

    await this.entityManager.query(sql, [productId, sellerSku]);

    return { success: true };
  }
  async removeFavorite(productId: string) {
    const sql = `
    DELETE FROM favorite_products
    WHERE product_id = ?
  `;

    const result = await this.entityManager.query(sql, [productId]);

    return {
      success: true
    };
  }
  async getFavoriteProductsAnalytics() {
    const sql = `
    SELECT
      p.id,
      p.title,
      p.thumbnail,
      p.price,
      p.sold_quantity AS soldQuantity,
      p.seller_sku,

      c.id AS categoryId,
      c.name AS categoryName,

      COALESCE(v.total_visits, 0) AS visits,
      (p.price * p.sold_quantity) AS revenue,

      psi.marketplaces,

      CASE
        WHEN psi.marketplaces IS NULL THEN 0
        ELSE 1
      END AS isPublishedElsewhere

    FROM favorite_products f

    INNER JOIN mercadolibre_products p
      ON p.id = f.product_id

    LEFT JOIN mercadolibre_categories c
      ON c.id = p.category_id

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    LEFT JOIN (
  SELECT
    seller_sku,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'marketplace', marketplace,
        'price', price,
        'stock', stock,
        'status', status,
        'isActive', is_active
      )
    ) AS marketplaces
  FROM product_sync_items
  GROUP BY seller_sku
) psi
  ON psi.seller_sku = p.seller_sku

    ORDER BY revenue DESC
  `;

    const rows = await this.entityManager.query(sql);

    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      thumbnail: r.thumbnail,
      seller_sku: r.seller_sku,
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      price: Number(r.price),
      soldQuantity: Number(r.soldQuantity),
      visits: Number(r.visits),
      revenue: Number(r.revenue),
      isPublishedElsewhere: Boolean(r.isPublishedElsewhere),
      marketplaces: r.marketplaces
        ? typeof r.marketplaces === 'string'
          ? JSON.parse(r.marketplaces)
          : r.marketplaces
        : []
    }));
  }
  async bulkAddFavorites(filters: {
    categoryId?: string;
    brand?: string;
    minRevenue?: number;
    minVisits?: number;
    minOrders?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { categoryId, brand, minRevenue, minVisits, minOrders, minPrice, maxPrice } = filters;

    const where: string[] = [];
    const values: any[] = [];

    if (categoryId) {
      where.push(`
      p.category_id IN (
        SELECT id
        FROM mercadolibre_categories
        WHERE path LIKE CONCAT(
          (SELECT path FROM mercadolibre_categories WHERE id = ?),
          '%'
        )
      )
    `);
      values.push(categoryId);
    }

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

    if (minRevenue !== undefined) {
      where.push(`(p.price * p.sold_quantity) >= ?`);
      values.push(minRevenue);
    }

    if (minVisits !== undefined) {
      where.push(`COALESCE(v.total_visits,0) >= ?`);
      values.push(minVisits);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    INSERT INTO favorite_products (product_id, seller_sku)
    SELECT p.id, p.seller_sku
    FROM mercadolibre_products p

    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id

    /* excluir publicados */
    LEFT JOIN (
      SELECT seller_sku
      FROM product_sync_items
      GROUP BY seller_sku
    ) psi
      ON psi.seller_sku = p.seller_sku

    ${whereClause}
    ${whereClause ? 'AND' : 'WHERE'} psi.seller_sku IS NULL

    ON DUPLICATE KEY UPDATE product_id = product_id
  `;

    const result = await this.entityManager.query(sql, values);

    return {
      success: true
    };
  }
}
