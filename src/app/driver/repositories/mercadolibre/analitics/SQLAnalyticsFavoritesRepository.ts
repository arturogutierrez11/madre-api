import { Injectable } from '@nestjs/common';
import { ISQLAnalyticsFavoritesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/ISQLAnalyticsFavoritesRepository';
import { EntityManager } from 'typeorm';

export type FavoritesFilters = {
  brand?: string;
  categoryId?: string;

  minPrice?: number;
  maxPrice?: number;

  minStock?: number;
  maxStock?: number;

  minVisits?: number;
  maxVisits?: number;

  minOrders?: number;
  maxOrders?: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type SortParams = {
  sortBy?: 'price' | 'visits' | 'soldQuantity' | 'stock';
  sortOrder?: 'asc' | 'desc';
};

export type FavoritesFiltersWithPagination = FavoritesFilters & PaginationParams & SortParams;

@Injectable()
export class SQLAnalyticsFavoritesRepository implements ISQLAnalyticsFavoritesRepository {
  constructor(private readonly entityManager: EntityManager) {}

  /* ================= MARKETPLACES ================= */

  async createMarketplace(name: string) {
    const sql = `
      INSERT INTO marketplaces (name)
      VALUES (?)
    `;

    await this.entityManager.query(sql, [name]);

    return { success: true };
  }

  async getMarketplaces() {
    const sql = `
      SELECT id, name, status
      FROM marketplaces
      ORDER BY name ASC
    `;

    return this.entityManager.query(sql);
  }

  /* ================= FAVORITES ================= */

  async addFavorite(marketplaceId: number, productId: string, sellerSku: string) {
    const sql = `
      INSERT INTO marketplace_favorite_products
        (product_id, seller_sku, marketplace_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE seller_sku = VALUES(seller_sku)
    `;

    await this.entityManager.query(sql, [productId, sellerSku, marketplaceId]);

    return { success: true };
  }

  /* ================= Eliminar items de FAVORITES ================= */

  async removeFavorite(marketplaceId: number, productId: string) {
    const sql = `
      DELETE FROM marketplace_favorite_products
      WHERE marketplace_id = ?
      AND product_id = ?
    `;

    await this.entityManager.query(sql, [marketplaceId, productId]);

    return { success: true };
  }

  async removeFavoritesBulk(marketplaceId: number, productIds: string[]) {
    if (!productIds.length) {
      return { success: true, deleted: 0 };
    }

    const placeholders = productIds.map(() => '?').join(',');

    const sql = `
    DELETE FROM marketplace_favorite_products
    WHERE marketplace_id = ?
    AND product_id IN (${placeholders})
  `;

    await this.entityManager.query(sql, [marketplaceId, ...productIds]);

    return {
      success: true,
      deleted: productIds.length
    };
  }

  /* ================= Obtener Items de una carpeta de FAVORITES ================= */

  async getFavorites(
    marketplaceId: number,
    filters?: {
      brand?: string;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      minStock?: number;
      maxStock?: number;
      minVisits?: number;
      maxVisits?: number;
      minOrders?: number;
      maxOrders?: number;
      page?: number;
      limit?: number;
      sortBy?: 'price' | 'visits' | 'soldQuantity' | 'stock';
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const values: any[] = [marketplaceId];
    let where = `WHERE mf.marketplace_id = ?`;

    // ================= FILTERS =================

    if (filters?.brand) {
      where += ` AND p.brand = ?`;
      values.push(filters.brand);
    }

    if (filters?.categoryId) {
      where += ` AND p.category_id = ?`;
      values.push(filters.categoryId);
    }

    if (filters?.minPrice !== undefined) {
      where += ` AND p.price >= ?`;
      values.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      where += ` AND p.price <= ?`;
      values.push(filters.maxPrice);
    }

    if (filters?.minStock !== undefined) {
      where += ` AND p.stock >= ?`;
      values.push(filters.minStock);
    }

    if (filters?.maxStock !== undefined) {
      where += ` AND p.stock <= ?`;
      values.push(filters.maxStock);
    }

    if (filters?.minOrders !== undefined) {
      where += ` AND p.sold_quantity >= ?`;
      values.push(filters.minOrders);
    }

    if (filters?.maxOrders !== undefined) {
      where += ` AND p.sold_quantity <= ?`;
      values.push(filters.maxOrders);
    }

    if (filters?.minVisits !== undefined) {
      where += ` AND COALESCE(v.total_visits, 0) >= ?`;
      values.push(filters.minVisits);
    }

    if (filters?.maxVisits !== undefined) {
      where += ` AND COALESCE(v.total_visits, 0) <= ?`;
      values.push(filters.maxVisits);
    }

    // ================= PAGINATION =================

    const page = Number(filters?.page ?? 1);
    const limit = Number(filters?.limit ?? 20);
    const offset = (page - 1) * limit;

    // ================= SORTING =================

    const allowedSortFields = {
      price: 'p.price',
      visits: 'visits',
      soldQuantity: 'p.sold_quantity',
      stock: 'p.stock'
    };

    let orderBy = 'ORDER BY p.id DESC';

    if (filters?.sortBy && allowedSortFields[filters.sortBy]) {
      const direction = filters.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      orderBy = `ORDER BY ${allowedSortFields[filters.sortBy]} ${direction}`;
    }

    // ================= TOTAL COUNT =================

    const countSql = `
    SELECT COUNT(*) as total
    FROM marketplace_favorite_products mf
    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id
    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id
    ${where}
  `;

    const [countResult] = await this.entityManager.query(countSql, values);
    const total = Number(countResult.total);

    // ================= DATA QUERY =================

    const sql = `
    SELECT
      p.id,
      p.title,
      p.thumbnail,
      p.price,
      p.stock,
      p.sold_quantity AS soldQuantity,
      p.brand,
      p.category_id AS categoryId,
      p.seller_sku,
      COALESCE(v.total_visits, 0) AS visits
    FROM marketplace_favorite_products mf
    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id
    LEFT JOIN mercadolibre_item_visits v
      ON v.item_id = p.id
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

    const data = await this.entityManager.query(sql, [...values, limit, offset]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /* ================= Agregar Items a una carpeta de FAVORITES ================= */

  async addFavoritesBulk(marketplaceId: number, items: { productId: string; sellerSku: string }[]) {
    if (!items.length) {
      return { success: true, inserted: 0 };
    }

    const values: any[] = [];

    const placeholders = items.map(() => '(?, ?, ?)').join(',');

    items.forEach(item => {
      values.push(item.productId, item.sellerSku, marketplaceId);
    });

    const sql = `
    INSERT INTO marketplace_favorite_products
      (product_id, seller_sku, marketplace_id)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      seller_sku = VALUES(seller_sku)
  `;

    await this.entityManager.query(sql, values);

    return {
      success: true,
      inserted: items.length
    };
  }

  /* ================= analitica de productos en carpeta ================= */
  async getMarketplaceOverview(marketplaceId: number) {
    const sql = `
    SELECT
      COUNT(p.id)                                 AS totalProducts,

      COALESCE(SUM(v.total_visits), 0)             AS totalVisits,

      COALESCE(SUM(p.sold_quantity), 0)            AS totalOrders,

      COALESCE(SUM(p.price * p.sold_quantity), 0)  AS totalRevenue,

      COALESCE(AVG(p.price), 0)                    AS avgPrice,

      COALESCE(
        SUM(p.price * p.sold_quantity) /
        NULLIF(SUM(p.sold_quantity), 0),
      0)                                           AS avgTicket,

      COUNT(DISTINCT p.brand)                      AS totalBrands,

      COUNT(DISTINCT p.category_id)                AS totalCategories

    FROM marketplace_favorite_products mf

    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id

    LEFT JOIN (
      SELECT
        item_id,
        SUM(total_visits) AS total_visits
      FROM mercadolibre_item_visits
      GROUP BY item_id
    ) v
      ON v.item_id = p.id

    WHERE mf.marketplace_id = ?
  `;

    const [result] = await this.entityManager.query(sql, [marketplaceId]);

    return {
      totalProducts: Number(result.totalProducts),
      totalVisits: Number(result.totalVisits),
      totalOrders: Number(result.totalOrders),
      totalRevenue: Number(result.totalRevenue),
      avgPrice: Number(result.avgPrice),
      avgTicket: Number(result.avgTicket),
      totalBrands: Number(result.totalBrands),
      totalCategories: Number(result.totalCategories)
    };
  }
  async getMarketplaceBrandsBreakdown(marketplaceId: number) {
    const sql = `
    SELECT
      p.brand,
      COUNT(*) AS totalProducts
    FROM marketplace_favorite_products mf
    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id
    WHERE mf.marketplace_id = ?
      AND p.brand IS NOT NULL
      AND p.brand <> ''
    GROUP BY p.brand
    ORDER BY totalProducts DESC
  `;

    return this.entityManager.query(sql, [marketplaceId]);
  }
  async getMarketplaceCategoriesBreakdown(marketplaceId: number) {
    const sql = `
    SELECT DISTINCT
      parent.id   AS categoryId,
      parent.name AS categoryName,
      parent.level,
      parent.path

    FROM marketplace_favorite_products mf

    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id

    INNER JOIN mercadolibre_categories leaf
      ON leaf.id = p.category_id

    INNER JOIN mercadolibre_categories parent
      ON FIND_IN_SET(
        parent.id,
        REPLACE(leaf.path, '.', ',')
      )

    WHERE mf.marketplace_id = ?
      AND parent.level IN (1, 2)

    ORDER BY parent.path ASC
  `;

    const rows = await this.entityManager.query(sql, [marketplaceId]);

    return rows.map(r => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      level: Number(r.level),
      totalProducts: 0,
      fullPath: r.categoryName
    }));
  }

  /* ================= Obtener datos de una carpeta ================= */

  async getMarketplaceById(id: number) {
    const sql = `
    SELECT id, name, status
    FROM marketplaces
    WHERE id = ?
    LIMIT 1
  `;

    const [result] = await this.entityManager.query(sql, [id]);
    return result;
  }
  async updateMarketplaceStatus(id: number, status: 'active' | 'closed') {
    const sql = `
    UPDATE marketplaces
    SET status = ?
    WHERE id = ?
  `;

    await this.entityManager.query(sql, [status, id]);

    return { success: true };
  }
  async deleteMarketplace(id: number) {
    // Primero eliminamos favoritos asociados
    await this.entityManager.query(`DELETE FROM marketplace_favorite_products WHERE marketplace_id = ?`, [id]);

    // Luego eliminamos la carpeta
    await this.entityManager.query(`DELETE FROM marketplaces WHERE id = ?`, [id]);

    return { success: true };
  }
}
