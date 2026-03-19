import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  DeduplicatedBySkuResult,
  ISQLMercadoLibreProductsRepository
} from 'src/core/adapters/repositories/mercadolibre/itemsDetails/ISQLMercadoLibreProductsRepository';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

const BULK_INSERT_BATCH_SIZE = 200;

@Injectable()
export class SQLMercadoLibreProductsRepository implements ISQLMercadoLibreProductsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async upsertBulkProducts(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<number> {
    const { sellerId, products } = params;

    if (!products.length) return 0;

    let total = 0;

    for (let i = 0; i < products.length; i += BULK_INSERT_BATCH_SIZE) {
      const batch = products.slice(i, i + BULK_INSERT_BATCH_SIZE);
      total += await this.executeBulkUpsert(sellerId, batch);
    }

    return total;
  }

  async findManyByIds(params: { sellerId: string; ids: string[] }): Promise<MercadoLibreProduct[]> {
    const { sellerId, ids } = params;

    if (!ids.length) return [];

    const placeholders = ids.map(() => '?').join(',');

    const rows = await this.entityManager.query(
      `
    SELECT *
    FROM mercadolibre_products
    WHERE seller_id = ?
      AND id IN (${placeholders})
    `,
      [sellerId, ...ids]
    );

    return rows;
  }

  private async executeBulkUpsert(sellerId: string, products: MercadoLibreProduct[]): Promise<number> {
    const placeholders = products.map(() => `(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).join(',');
    const values: any[] = [];

    for (const p of products) {
      values.push(
        p.id,
        sellerId,
        p.categoryId ?? null,
        p.title ?? null,
        p.price ?? 0,
        p.currency ?? null,
        p.stock ?? 0,
        p.soldQuantity ?? 0,
        p.status ?? null,
        p.condition ?? null,
        p.permalink ?? null,
        p.thumbnail ?? null,
        JSON.stringify(p.pictures ?? []),
        p.sellerSku ?? null,
        p.brand ?? null,
        p.warranty ?? null,
        p.freeShipping ? 1 : 0,
        p.health ?? 0,
        this.formatDate(p.lastUpdated),
        p.description ?? null
      );
    }

    const sql = `
      INSERT INTO mercadolibre_products (
        id,
        seller_id,
        category_id,
        title,
        price,
        currency,
        stock,
        sold_quantity,
        status,
        \`condition\`,
        permalink,
        thumbnail,
        pictures,
        seller_sku,
        brand,
        warranty,
        free_shipping,
        health,
        last_updated,
        description
      )
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        category_id = VALUES(category_id),
        title = VALUES(title),
        price = VALUES(price),
        currency = VALUES(currency),
        stock = VALUES(stock),
        sold_quantity = VALUES(sold_quantity),
        status = VALUES(status),
        \`condition\` = VALUES(\`condition\`),
        permalink = VALUES(permalink),
        thumbnail = VALUES(thumbnail),
        pictures = VALUES(pictures),
        seller_sku = VALUES(seller_sku),
        brand = VALUES(brand),
        warranty = VALUES(warranty),
        free_shipping = VALUES(free_shipping),
        health = VALUES(health),
        last_updated = VALUES(last_updated),
        description = VALUES(description),
        updated_at = NOW()
    `;

    const result: any = await this.entityManager.query(sql, values);

    return result?.affectedRows ?? products.length;
  }

  async findAll(
    { limit, offset }: { limit: number; offset: number },
    filters?: { sellerId?: string; status?: string }
  ): Promise<PaginatedResult<any>> {
    const where: string[] = [];
    const params: any[] = [];

    if (filters?.sellerId) {
      where.push('seller_id = ?');
      params.push(filters.sellerId);
    }

    if (filters?.status) {
      where.push('status = ?');
      params.push(filters.status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_products
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const countResult = await this.entityManager.query(
      `
      SELECT COUNT(*) AS total
      FROM mercadolibre_products
      ${whereClause}
      `,
      params
    );

    const total = Number(countResult[0].total);
    const hasNext = offset + limit < total;

    return {
      items: rows,
      total,
      limit,
      offset,
      count: rows.length,
      hasNext,
      nextOffset: hasNext ? offset + limit : null
    };
  }

  private formatDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;

    const d = new Date(date);

    return d
      .toISOString()
      .slice(0, 19) // YYYY-MM-DDTHH:mm:ss
      .replace('T', ' ');
  }

  async findDeduplicatedBySku(params: {
    limit: number;
    offset: number;
  }): Promise<DeduplicatedBySkuResult> {
    const { limit, offset } = params;

    const countResult = await this.entityManager.query(`
      SELECT COUNT(DISTINCT seller_sku) AS total
      FROM mercadolibre_products
      WHERE seller_sku IS NOT NULL AND seller_sku != ''
    `);
    const total = Number(countResult[0].total);

    const rows = await this.entityManager.query(
      `
      SELECT mp.*
      FROM mercadolibre_products mp
      INNER JOIN (
        SELECT MIN(mp_inner.id) AS id
        FROM mercadolibre_products mp_inner
        INNER JOIN (
          SELECT seller_sku, MIN(price) AS min_price
          FROM mercadolibre_products
          WHERE seller_sku IS NOT NULL AND seller_sku != ''
          GROUP BY seller_sku
        ) best_price
          ON mp_inner.seller_sku = best_price.seller_sku
         AND mp_inner.price = best_price.min_price
        GROUP BY mp_inner.seller_sku
      ) chosen ON mp.id = chosen.id
      ORDER BY mp.seller_sku
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const items: MercadoLibreProduct[] = rows.map((row: any) => this.mapRowToProduct(row));

    return {
      items,
      total,
      hasMore: offset + limit < total
    };
  }

  private mapRowToProduct(row: any): MercadoLibreProduct {
    let pictures: string[] = [];
    try {
      pictures = typeof row.pictures === 'string' ? JSON.parse(row.pictures) : (row.pictures ?? []);
    } catch {
      pictures = [];
    }

    return {
      id: row.id,
      categoryId: row.category_id ?? null,
      title: row.title ?? '',
      price: Number(row.price ?? 0),
      currency: row.currency ?? '',
      stock: Number(row.stock ?? 0),
      soldQuantity: Number(row.sold_quantity ?? 0),
      status: row.status ?? '',
      condition: row.condition ?? '',
      permalink: row.permalink ?? '',
      thumbnail: row.thumbnail ?? '',
      pictures,
      sellerSku: row.seller_sku ?? undefined,
      brand: row.brand ?? undefined,
      warranty: row.warranty ?? undefined,
      freeShipping: row.free_shipping === 1 || row.free_shipping === true,
      health: row.health != null ? Number(row.health) : undefined,
      lastUpdated: row.last_updated ?? undefined,
      description: row.description ?? ''
    };
  }

  async updateFullBulkProducts(params: { sellerId: string; products: MercadoLibreProduct[] }): Promise<number> {
    const { sellerId, products } = params;

    if (!products.length) return 0;

    let affected = 0;

    for (let i = 0; i < products.length; i += BULK_INSERT_BATCH_SIZE) {
      const batch = products.slice(i, i + BULK_INSERT_BATCH_SIZE);

      for (const p of batch) {
        const result: any = await this.entityManager.query(
          `
        UPDATE mercadolibre_products
        SET
          category_id = ?,
          title = ?,
          price = ?,
          currency = ?,
          stock = ?,
          sold_quantity = ?,
          status = ?,
          \`condition\` = ?,
          permalink = ?,
          thumbnail = ?,
          pictures = ?,
          seller_sku = ?,
          brand = ?,
          warranty = ?,
          free_shipping = ?,
          health = ?,
          last_updated = ?,
          description = ?,
          updated_at = NOW()
        WHERE id = ? AND seller_id = ?
        `,
          [
            p.categoryId ?? null,
            p.title ?? null,
            p.price ?? 0,
            p.currency ?? null,
            p.stock ?? 0,
            p.soldQuantity ?? 0,
            p.status ?? null,
            p.condition ?? null,
            p.permalink ?? null,
            p.thumbnail ?? null,
            JSON.stringify(p.pictures ?? []),
            p.sellerSku ?? null,
            p.brand ?? null,
            p.warranty ?? null,
            p.freeShipping ? 1 : 0,
            p.health ?? 0,
            this.formatDate(p.lastUpdated),
            p.description ?? null,
            p.id,
            sellerId
          ]
        );

        affected += result?.affectedRows ?? 0;
      }
    }

    return affected;
  }
}
