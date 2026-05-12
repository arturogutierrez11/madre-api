import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  AutomeliProductSnapshotRecord,
  IAutomeliProductSnapshotsRepository
} from 'src/core/adapters/repositories/automeli/snapshots/IAutomeliProductSnapshotsRepository';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

const BULK_INSERT_BATCH_SIZE = 500;

@Injectable()
export class SQLAutomeliProductSnapshotsRepository implements IAutomeliProductSnapshotsRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async upsertBulk(products: AutomeliProduct[]): Promise<number> {
    if (!products.length) {
      return 0;
    }

    let totalAffected = 0;

    for (let i = 0; i < products.length; i += BULK_INSERT_BATCH_SIZE) {
      const batch = products.slice(i, i + BULK_INSERT_BATCH_SIZE);
      totalAffected += await this.executeBulkUpsert(batch);
    }

    return totalAffected;
  }

  async findBySkus(skus: string[]): Promise<AutomeliProductSnapshotRecord[]> {
    const normalizedSkus = [...new Set(
      (skus ?? [])
        .map(sku => String(sku ?? '').trim().toUpperCase())
        .filter(Boolean)
    )];

    if (!normalizedSkus.length) {
      return [];
    }

    const placeholders = normalizedSkus.map(() => '?').join(', ');

    const rows = await this.entityManager.query(
      `
        SELECT
          mla,
          sku,
          total_price,
          scraped_price,
          stock_quantity,
          amz_status,
          changed,
          max_weight,
          meli_sale_price,
          meli_status,
          listing_type_id,
          sub_status,
          app_status,
          created_at,
          updated_at
        FROM automeli_product_snapshots
        WHERE UPPER(TRIM(sku)) IN (${placeholders})
        ORDER BY sku ASC, mla ASC
      `,
      normalizedSkus
    );

    return rows.map((row: any) => ({
      mla: String(row.mla),
      sku: String(row.sku).trim().toUpperCase(),
      totalPrice: row.total_price != null ? Number(row.total_price) : null,
      scrapedPrice: row.scraped_price != null ? Number(row.scraped_price) : null,
      stockQuantity: row.stock_quantity != null ? Number(row.stock_quantity) : null,
      amzStatus: row.amz_status ?? null,
      changed: row.changed ?? null,
      maxWeight: row.max_weight != null ? Number(row.max_weight) : null,
      meliSalePrice: row.meli_sale_price != null ? Number(row.meli_sale_price) : null,
      meliStatus: row.meli_status ?? null,
      listingTypeId: row.listing_type_id ?? null,
      subStatus: row.sub_status ?? null,
      appStatus: row.app_status != null ? Number(row.app_status) : null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    }));
  }

  private async executeBulkUpsert(products: AutomeliProduct[]): Promise<number> {
    if (!products.length) {
      return 0;
    }

    const placeholders = products
      .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())')
      .join(',');

    const values: any[] = [];

    for (const product of products) {
      values.push(
        product.idMeli,
        product.sku,
        product.totalPrice,
        product.scrapedPrice,
        product.stockQuantity,
        product.amzStatus,
        product.changed,
        product.maxWeight,
        product.meliSalePrice,
        product.meliStatus,
        product.listingTypeId,
        product.subStatus,
        product.appStatus
      );
    }

    const sql = `
      INSERT INTO automeli_product_snapshots (
        mla,
        sku,
        total_price,
        scraped_price,
        stock_quantity,
        amz_status,
        changed,
        max_weight,
        meli_sale_price,
        meli_status,
        listing_type_id,
        sub_status,
        app_status,
        created_at,
        updated_at
      )
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        sku = VALUES(sku),
        total_price = VALUES(total_price),
        scraped_price = VALUES(scraped_price),
        stock_quantity = VALUES(stock_quantity),
        amz_status = VALUES(amz_status),
        changed = VALUES(changed),
        max_weight = VALUES(max_weight),
        meli_sale_price = VALUES(meli_sale_price),
        meli_status = VALUES(meli_status),
        listing_type_id = VALUES(listing_type_id),
        sub_status = VALUES(sub_status),
        app_status = VALUES(app_status),
        updated_at = NOW()
    `;

    const result: any = await this.entityManager.query(sql, values);
    return result?.affectedRows ?? products.length;
  }
}
