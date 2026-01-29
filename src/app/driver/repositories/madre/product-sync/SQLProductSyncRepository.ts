import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';

import { IProductSyncRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRepository';
import { ProductSyncItem } from 'src/core/entities/product-sync/ProductSyncItem';

@Injectable()
export class SQLProductSyncRepository implements IProductSyncRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  /* ======================================
     BULK UPSERT
  ====================================== */
  async bulkUpsert(items: ProductSyncItem[]): Promise<void> {
    await this.entityManager.transaction(async manager => {
      for (const item of items) {
        const rows = await manager.query<any[]>(
          `
          SELECT *
          FROM product_sync_items
          WHERE marketplace = ? AND external_id = ?
          LIMIT 1
          `,
          [item.marketplace, item.externalId]
        );

        if (rows.length === 0) {
          await manager.query(
            `
            INSERT INTO product_sync_items (
              id,
              marketplace,
              external_id,
              seller_sku,
              marketplace_sku,
              price,
              stock,
              status,
              raw_payload,
              last_seen_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
              randomUUID(),
              item.marketplace,
              item.externalId,
              item.sellerSku,
              item.marketplaceSku,
              item.price,
              item.stock,
              item.status,
              JSON.stringify(item.raw)
            ]
          );
          continue;
        }

        const current = rows[0];

        const hasChanged =
          Number(current.price) !== item.price ||
          Number(current.stock) !== item.stock ||
          current.status !== item.status;

        if (hasChanged) {
          await manager.query(
            `
            UPDATE product_sync_items
            SET
              price = ?,
              stock = ?,
              status = ?,
              raw_payload = ?,
              last_seen_at = NOW()
            WHERE id = ?
            `,
            [item.price, item.stock, item.status, JSON.stringify(item.raw), current.id]
          );

          await manager.query(
            `
            INSERT INTO product_sync_history (
              id,
              product_sync_item_id,
              price,
              stock,
              status,
              raw_payload
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [randomUUID(), current.id, item.price, item.stock, item.status, JSON.stringify(item.raw)]
          );
        } else {
          await manager.query(
            `
            UPDATE product_sync_items
            SET last_seen_at = NOW()
            WHERE id = ?
            `,
            [current.id]
          );
        }
      }
    });
  }

  /* ======================================
     FIND ITEM
  ====================================== */
  async findItemById(id: string): Promise<any | null> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM product_sync_items
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  async findItemBySellerSku(marketplace: string, sellerSku: string): Promise<any | null> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM product_sync_items
      WHERE marketplace = ?
        AND seller_sku = ?
      LIMIT 1
      `,
      [marketplace, sellerSku]
    );

    return rows[0] ?? null;
  }

  /* ======================================
     HISTORY (ID)
  ====================================== */
  async findHistoryByProductSyncItemId(productSyncItemId: string): Promise<any[]> {
    return this.entityManager.query(
      `
      SELECT
        id,
        product_sync_item_id,
        price,
        stock,
        status,
        raw_payload,
        created_at
      FROM product_sync_history
      WHERE product_sync_item_id = ?
      ORDER BY created_at DESC
      `,
      [productSyncItemId]
    );
  }

  async findHistoryByStatus(productSyncItemId: string, status: string): Promise<any[]> {
    return this.entityManager.query(
      `
      SELECT *
      FROM product_sync_history
      WHERE product_sync_item_id = ?
        AND status = ?
      ORDER BY created_at DESC
      `,
      [productSyncItemId, status]
    );
  }

  async listSyncItems(marketplace: string, limit: number, offset: number): Promise<any[]> {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    return this.entityManager.query(
      `
    SELECT
      id,
      seller_sku,
      external_id,
      price,
      stock,
      status,
      last_seen_at,
      raw_payload
    FROM product_sync_items
    WHERE marketplace = ?
    ORDER BY seller_sku
    LIMIT ${safeLimit} OFFSET ${safeOffset}
    `,
      [marketplace]
    );
  }

  async countSyncItems(marketplace: string): Promise<number> {
    const rows = await this.entityManager.query(
      `
    SELECT COUNT(*) AS total
    FROM product_sync_items
    WHERE marketplace = ?
    `,
      [marketplace]
    );

    return Number(rows[0]?.total ?? 0);
  }

  async countSyncItemsByStatus(marketplace: string): Promise<{ status: string; total: number }[]> {
    return this.entityManager.query(
      `
    SELECT
      status,
      COUNT(*) AS total
    FROM product_sync_items
    WHERE marketplace = ?
      AND status IN ('ACTIVE', 'PAUSED', 'PENDING', 'ERROR', 'DELETED')
    GROUP BY status
    `,
      [marketplace]
    );
  }

  /* ======================================
     HISTORY (SELLER SKU)
  ====================================== */
  async findHistoryBySellerSku(marketplace: string, sellerSku: string): Promise<any[]> {
    const item = await this.findItemBySellerSku(marketplace, sellerSku);
    if (!item) return [];

    return this.findHistoryByProductSyncItemId(item.id);
  }

  async findHistoryBySellerSkuAndStatus(marketplace: string, sellerSku: string, status: string): Promise<any[]> {
    const item = await this.findItemBySellerSku(marketplace, sellerSku);
    if (!item) return [];

    return this.findHistoryByStatus(item.id, status);
  }
}
