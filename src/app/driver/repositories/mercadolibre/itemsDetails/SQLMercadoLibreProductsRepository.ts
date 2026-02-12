import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ISQLMercadoLibreProductsRepository } from 'src/core/adapters/repositories/mercadolibre/itemsDetails/ISQLMercadoLibreProductsRepository';
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

  private async executeBulkUpsert(sellerId: string, products: MercadoLibreProduct[]): Promise<number> {
    const placeholders = products.map(() => `(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).join(',');

    const values: any[] = [];

    for (const p of products) {
      values.push(
        p.id,
        sellerId,
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
}
