import { Injectable } from '@nestjs/common';
import { ISQLAnalyticsFavoritesRepository } from 'src/core/adapters/repositories/mercadolibre/analitics/ISQLAnalyticsFavoritesRepository';
import { EntityManager } from 'typeorm';

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
      SELECT id, name
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

  async removeFavorite(marketplaceId: number, productId: string) {
    const sql = `
      DELETE FROM marketplace_favorite_products
      WHERE marketplace_id = ?
      AND product_id = ?
    `;

    await this.entityManager.query(sql, [marketplaceId, productId]);

    return { success: true };
  }

  async getFavorites(marketplaceId: number) {
    const sql = `
      SELECT
        p.id,
        p.title,
        p.thumbnail,
        p.price,
        p.sold_quantity AS soldQuantity,
        p.seller_sku
      FROM marketplace_favorite_products mf

      INNER JOIN mercadolibre_products p
        ON p.id = mf.product_id

      WHERE mf.marketplace_id = ?
    `;

    return this.entityManager.query(sql, [marketplaceId]);
  }
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
    SELECT
      p.category_id AS categoryId,
      COUNT(*) AS totalProducts
    FROM marketplace_favorite_products mf
    INNER JOIN mercadolibre_products p
      ON p.id = mf.product_id
    WHERE mf.marketplace_id = ?
      AND p.category_id IS NOT NULL
    GROUP BY p.category_id
    ORDER BY totalProducts DESC
  `;

    return this.entityManager.query(sql, [marketplaceId]);
  }
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
