import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  AutomeliProductSnapshotsListParams,
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
        WHERE sku IN (${placeholders})
        ORDER BY
          sku ASC,
          CASE
            WHEN listing_type_id = 'gold_special' THEN 0
            WHEN listing_type_id = 'gold_pro' THEN 1
            ELSE 2
          END ASC,
          updated_at DESC,
          mla ASC
      `,
      normalizedSkus
    );

    return rows.map((row: any) => ({
      ...this.mapRow(row),
      sku: String(row.sku).trim().toUpperCase()
    }));
  }

  async findAll(params: AutomeliProductSnapshotsListParams) {
    const safeLimit = Number(params.limit);
    const safeOffset = Number(params.offset);
    const where: string[] = [];
    const values: any[] = [];

    this.pushStringLikeFilter(where, values, 'mla', params.mla);
    this.pushStringLikeFilter(where, values, 'sku', params.sku);
    this.pushNumberFilter(where, values, 'total_price', params.totalPrice, params.totalPriceMin, params.totalPriceMax);
    this.pushNumberFilter(
      where,
      values,
      'scraped_price',
      params.scrapedPrice,
      params.scrapedPriceMin,
      params.scrapedPriceMax
    );
    this.pushNumberFilter(
      where,
      values,
      'stock_quantity',
      params.stockQuantity,
      params.stockQuantityMin,
      params.stockQuantityMax
    );
    this.pushStringLikeFilter(where, values, 'amz_status', params.amzStatus);
    this.pushStringLikeFilter(where, values, 'changed', params.changed);
    this.pushNumberFilter(where, values, 'max_weight', params.maxWeight, params.maxWeightMin, params.maxWeightMax);
    this.pushNumberFilter(
      where,
      values,
      'meli_sale_price',
      params.meliSalePrice,
      params.meliSalePriceMin,
      params.meliSalePriceMax
    );
    this.pushStringLikeFilter(where, values, 'meli_status', params.meliStatus);
    this.pushStringLikeFilter(where, values, 'listing_type_id', params.listingTypeId);
    this.pushStringLikeFilter(where, values, 'sub_status', params.subStatus);

    if (params.appStatus != null && !Number.isNaN(Number(params.appStatus))) {
      where.push('app_status = ?');
      values.push(Number(params.appStatus));
    }

    this.pushDateRangeFilter(where, values, 'created_at', params.createdAtFrom, params.createdAtTo);
    this.pushDateRangeFilter(where, values, 'updated_at', params.updatedAtFrom, params.updatedAtTo);

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

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
        ${whereClause}
        ORDER BY updated_at DESC, mla ASC
        LIMIT ? OFFSET ?
      `,
      [...values, safeLimit, safeOffset]
    );

    const countRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM automeli_product_snapshots
        ${whereClause}
      `,
      values
    );

    const total = Number(countRows[0]?.total ?? 0);
    const hasNext = safeOffset + safeLimit < total;
    const items = rows.map((row: any) => this.mapRow(row));

    return {
      items,
      total,
      limit: safeLimit,
      offset: safeOffset,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? safeOffset + safeLimit : null
    };
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

  private mapRow(row: any): AutomeliProductSnapshotRecord {
    return {
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
    };
  }

  private pushStringLikeFilter(where: string[], values: any[], column: string, value?: string) {
    if (!value?.trim()) {
      return;
    }

    where.push(`${column} LIKE ?`);
    values.push(`%${value.trim()}%`);
  }

  private pushNumberFilter(
    where: string[],
    values: any[],
    column: string,
    exact?: number,
    min?: number,
    max?: number
  ) {
    if (exact != null && !Number.isNaN(Number(exact))) {
      where.push(`${column} = ?`);
      values.push(Number(exact));
      return;
    }

    if (min != null && !Number.isNaN(Number(min))) {
      where.push(`${column} >= ?`);
      values.push(Number(min));
    }

    if (max != null && !Number.isNaN(Number(max))) {
      where.push(`${column} <= ?`);
      values.push(Number(max));
    }
  }

  private pushDateRangeFilter(where: string[], values: any[], column: string, from?: string, to?: string) {
    if (from?.trim()) {
      where.push(`${column} >= ?`);
      values.push(from.trim());
    }

    if (to?.trim()) {
      where.push(`${column} <= ?`);
      values.push(to.trim());
    }
  }
}
