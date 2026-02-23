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
}
