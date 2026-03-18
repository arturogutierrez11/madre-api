import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IAnalyticsProductsRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/IAnalyticsProductsRepository';
import { EntityManager } from 'typeorm';

type ProductsFilters = {
  brand?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minVisits?: number;
  maxVisits?: number;
  minOrders?: number;
  maxOrders?: number;
  status?: 'active' | 'under_review' | 'paused' | 'closed';
  excludeMarketplace?: string[];
  inMarketplace?: number;
  marketplaceStatus?: 'published' | 'not_published';
  matchedMarketplace?: 'megatone' | 'fravega';
};

@Injectable()
export class SQLAnalyticsProductsRepository implements IAnalyticsProductsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  /* ============================================================
     🔹 METADATA - CATEGORIES TREE
     ============================================================ */

  async getCategoriesTree(search?: string) {
    const values: any[] = [];
    let where = '';

    if (search) {
      where = `WHERE name LIKE ?`;
      values.push(`%${search}%`);
    }

    const sql = `
      SELECT
        id,
        name,
        parent_id,
        level,
        path,
        is_leaf
      FROM mercadolibre_categories
      ${where}
      ORDER BY path ASC
    `;

    return this.entityManager.query(sql, values);
  }

  /* ============================================================
     🔹 METADATA - BRANDS (PARA SELECT / BUSCADOR)
     ============================================================ */

  async getBrands(search?: string) {
    const values: any[] = [];
    let where = "WHERE brand IS NOT NULL AND brand <> ''";

    if (search) {
      where += ` AND brand LIKE ?`;
      values.push(`%${search}%`);
    }

    const sql = `
    SELECT DISTINCT brand
    FROM mercadolibre_products
    ${where}
    ORDER BY brand ASC
    LIMIT 100
  `;

    return this.entityManager.query(sql, values);
  }

  /* ============================================================
     🔹 FILTER BUILDER (REUTILIZABLE)
     ============================================================ */

  private async buildFilters(params: ProductsFilters) {
    const where: string[] = [];
    const values: any[] = [];

    /* ===== BRAND ===== */
    if (params.brand) {
      where.push(`p.brand = ?`);
      values.push(params.brand);
    }

    /* ===== CATEGORY (SUBTREE) ===== */
    if (params.categoryId) {
      const pathRow = await this.entityManager.query(`SELECT path FROM mercadolibre_categories WHERE id = ?`, [
        params.categoryId
      ]);

      const categoryPath = pathRow[0]?.path;

      if (categoryPath) {
        where.push(`c.path LIKE ?`);
        values.push(`${categoryPath}%`);
      }
    }

    /* ===== PRICE ===== */
    if (params.minPrice !== undefined) {
      where.push(`p.price >= ?`);
      values.push(params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      where.push(`p.price <= ?`);
      values.push(params.maxPrice);
    }

    /* ===== ORDERS ===== */
    if (params.minOrders !== undefined) {
      where.push(`p.sold_quantity >= ?`);
      values.push(params.minOrders);
    }

    if (params.maxOrders !== undefined) {
      where.push(`p.sold_quantity <= ?`);
      values.push(params.maxOrders);
    }

    /* ===== VISITS ===== */
    if (params.minVisits !== undefined) {
      where.push(`COALESCE(v.total_visits, 0) >= ?`);
      values.push(params.minVisits);
    }

    if (params.maxVisits !== undefined) {
      where.push(`COALESCE(v.total_visits, 0) <= ?`);
      values.push(params.maxVisits);
    }

    /* ===== EN CARPETA ===== */
    if (params.inMarketplace) {
      where.push(`
        EXISTS (
          SELECT 1
          FROM marketplace_favorite_products mf
          WHERE mf.product_id = p.id
          AND mf.marketplace_id = ?
        )
      `);
      values.push(params.inMarketplace);
    }

    /* ===== PUBLICATION STATUS ===== */
    if (params.marketplaceStatus === 'published') {
      where.push(`
        EXISTS (
          SELECT 1
          FROM product_sync_items psi
          WHERE psi.seller_sku = p.seller_sku
          AND psi.is_active = 1
        )
      `);
    }

    if (params.marketplaceStatus === 'not_published') {
      where.push(`
        NOT EXISTS (
          SELECT 1
          FROM product_sync_items psi
          WHERE psi.seller_sku = p.seller_sku
          AND psi.is_active = 1
        )
      `);
    }

    /* ===== EXCLUDE MARKETPLACE ===== */
    if (params.excludeMarketplace?.length) {
      const placeholders = params.excludeMarketplace.map(() => '?').join(',');

      where.push(`
        NOT EXISTS (
          SELECT 1
          FROM product_sync_items psi
          WHERE psi.seller_sku = p.seller_sku
          AND psi.marketplace IN (${placeholders})
          AND psi.is_active = 1
        )
      `);

      values.push(...params.excludeMarketplace);
    }

    /* ===== MATCHED MARKETPLACE (DINÁMICO) ===== */
    if (params.matchedMarketplace) {
      const tableMap = {
        megatone: 'meli_megatone_match_brand',
        fravega: 'meli_fravega_match_brand'
      };

      const table = tableMap[params.matchedMarketplace];

      if (table) {
        where.push(`
      EXISTS (
        SELECT 1
        FROM ${table} mb
        WHERE mb.meli_brand = p.brand
        AND mb.confidence > 0.8
      )
    `);
      }
    }

    /* ===== PRODUCT STATUS IN MELI===== */
    if (params.status) {
      where.push(`p.status = ?`);
      values.push(params.status);
    }
    return {
      whereClause: where.length ? `WHERE ${where.join(' AND ')}` : '',
      values
    };
  }

  /* ============================================================
     🔹 OVERVIEW
     ============================================================ */

  async getProductsOverview(params: ProductsFilters) {
    const { whereClause, values } = await this.buildFilters(params);

    const sql = `
    SELECT
      COUNT(DISTINCT CASE 
        WHEN p.seller_sku IS NOT NULL 
          AND p.seller_sku != ''
          AND LENGTH(p.seller_sku) <= 13 
        THEN p.seller_sku 
      END) AS totalProducts,

      COALESCE(SUM(p.sold_quantity), 0) AS totalOrders,

      COALESCE(SUM(v.total_visits), 0) AS totalVisits,

      COALESCE(SUM(p.price * p.sold_quantity), 0) AS totalRevenue,

      COALESCE(AVG(p.price), 0) AS avgPrice,

      CASE
        WHEN SUM(p.sold_quantity) > 0
        THEN SUM(p.price * p.sold_quantity) / SUM(p.sold_quantity)
        ELSE 0
      END AS avgTicket

    FROM mercadolibre_products p
    JOIN mercadolibre_categories c ON c.id = p.category_id
    LEFT JOIN mercadolibre_item_visits v ON v.item_id = p.id

    ${whereClause}
  `;

    const result = await this.entityManager.query(sql, values);
    const row = result[0] ?? {};

    return {
      totalProducts: Number(row.totalProducts ?? 0),
      totalOrders: Number(row.totalOrders ?? 0),
      totalVisits: Number(row.totalVisits ?? 0),
      totalRevenue: Number(row.totalRevenue ?? 0),
      avgPrice: Number(row.avgPrice ?? 0),
      avgTicket: Number(row.avgTicket ?? 0)
    };
  }

  /* ============================================================
     🔹 SAVE SELECTION
     ============================================================ */

  async saveSelectionToFolder(marketplaceId: number, filters: ProductsFilters) {
    const { whereClause, values } = await this.buildFilters(filters);

    const batchSize = 5000;
    let offset = 0;
    let totalInserted = 0;

    while (true) {
      const selectSql = `
      SELECT
        MIN(p.id) as id,
        TRIM(UPPER(SUBSTRING_INDEX(p.seller_sku, '/', 1))) as seller_sku
      FROM mercadolibre_products p
      JOIN mercadolibre_categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT item_id, SUM(total_visits) total_visits
        FROM mercadolibre_item_visits
        GROUP BY item_id
      ) v ON v.item_id = p.id
      ${whereClause}
      AND p.seller_sku IS NOT NULL
      AND p.seller_sku != ''
      AND LENGTH(SUBSTRING_INDEX(p.seller_sku, '/', 1)) <= 13
      GROUP BY TRIM(UPPER(SUBSTRING_INDEX(p.seller_sku, '/', 1)))
      LIMIT ${batchSize} OFFSET ${offset}
    `;

      const products: { id: string; seller_sku: string }[] = await this.entityManager.query(selectSql, values);

      if (!products.length) break;

      const placeholders = products.map(() => '(?,?,?)').join(',');
      const params: any[] = [];

      products.forEach(p => {
        params.push(p.id, p.seller_sku, marketplaceId);
      });

      await this.entityManager.query(
        `
      INSERT IGNORE INTO marketplace_favorite_products
      (product_id, seller_sku, marketplace_id)
      VALUES ${placeholders}
      `,
        params
      );

      totalInserted += products.length;
      offset += batchSize;
    }

    return {
      success: true,
      totalProcessed: totalInserted
    };
  }

  /* ============================================================
   🔹 METADATA - CATEGORIES TREE (SELECT COMPLETO)
   ============================================================ */

  async getCategoriesForSelect() {
    const sql = `
    SELECT
      id,
      name,
      parent_id,
      level,
      path,
      is_leaf
    FROM mercadolibre_categories
    ORDER BY path ASC
  `;

    return this.entityManager.query(sql);
  }

  /* ============================================================
   🔹 METADATA - SEARCH CATEGORIES (BUSCADOR)
   ============================================================ */

  async searchCategoriesByName(search: string) {
    const sql = `
    SELECT
      id,
      name,
      parent_id,
      level,
      path,
      is_leaf
    FROM mercadolibre_categories
    WHERE name LIKE ?
    ORDER BY level ASC, name ASC
    LIMIT 50
  `;

    return this.entityManager.query(sql, [`%${search}%`]);
  }
  /* ============================================================
     🔹 GUARDAR LA BUSQUEDA 
     ============================================================ */

  async saveSelectionAsSegment(marketplaceId: number, filters: ProductsFilters) {
    const { whereClause, values } = await this.buildFilters(filters);

    const segmentInsert = `
    INSERT INTO marketplace_filter_segments
      (marketplace_id, filters_json, total_products)
    VALUES (?, ?, 0)
  `;

    const segmentResult: any = await this.entityManager.query(segmentInsert, [marketplaceId, JSON.stringify(filters)]);

    const segmentId = segmentResult.insertId;

    const insertProductsSql = `
    INSERT INTO marketplace_segment_products
      (segment_id, product_id, seller_sku, marketplace_id)

    SELECT
      ?,
      p.id,
      p.seller_sku,
      ?

    FROM mercadolibre_products p
    JOIN mercadolibre_categories c ON c.id = p.category_id
    LEFT JOIN mercadolibre_item_visits v ON v.item_id = p.id

    ${whereClause}

    ON DUPLICATE KEY UPDATE
      seller_sku = VALUES(seller_sku)
  `;

    await this.entityManager.query(insertProductsSql, [segmentId, marketplaceId, ...values]);

    const countSql = `
    SELECT COUNT(*) as total
    FROM marketplace_segment_products
    WHERE segment_id = ?
  `;

    const countResult = await this.entityManager.query(countSql, [segmentId]);

    await this.entityManager.query(`UPDATE marketplace_filter_segments SET total_products = ? WHERE id = ?`, [
      countResult[0].total,
      segmentId
    ]);

    return {
      success: true,
      segmentId,
      totalProducts: countResult[0].total
    };
  }
}
