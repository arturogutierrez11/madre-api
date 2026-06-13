import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NormalizedOrderDTO } from 'src/app/controller/madre/orders/dto/CreateOrdersBatch.dto';
import { UpdateOrderStatusDTO } from 'src/app/controller/madre/orders/dto/UpdateOrderStatus.dto';
import {
  InsertOrdersResult,
  ISQLOrdersRepository
} from 'src/core/adapters/repositories/madre/orders/ISQLOrdersRepository';
import { EntityManager } from 'typeorm';

const TABLE = 'development_orders';

const INSERT_COLUMNS = [
  'marketplace',
  'external_order_id',
  'external_suborder_id',
  'unique_key',
  'purchase_date',
  'customer_name',
  'customer_document',
  'customer_phone',
  'customer_email',
  'amount_total',
  'currency',
  'status',
  'delivery_status',
  'items_quantity',
  'shipping_address',
  'shipping_city',
  'shipping_province',
  'shipping_zip_code',
  'source_payload',
  'normalized_payload',
  'source_schema_version'
] as const;

const SELECT_FIELDS = `
  id, marketplace, external_order_id, external_suborder_id, unique_key,
  DATE_FORMAT(purchase_date, '%Y-%m-%dT%H:%i:%sZ') AS purchase_date,
  customer_name, customer_document, customer_phone, customer_email,
  amount_total, currency, status, delivery_status, items_quantity,
  shipping_address, shipping_city, shipping_province, shipping_zip_code,
  source_payload, normalized_payload, source_schema_version,
  persistence_status, notification_system_a_status, notification_system_b_status,
  floxu_code, last_error,
  DATE_FORMAT(last_processed_at, '%Y-%m-%dT%H:%i:%sZ') AS last_processed_at,
  DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
  DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%sZ') AS updated_at
`;

@Injectable()
export class SQLOrdersRepository implements ISQLOrdersRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async insertBatch(orders: NormalizedOrderDTO[]): Promise<InsertOrdersResult> {
    if (!orders || orders.length === 0) {
      return { total: 0, inserted: 0, skipped: 0 };
    }

    const keys = orders.map(order => order.unique_key);
    const inPlaceholders = keys.map(() => '?').join(', ');
    const existingRows: any[] = await this.productosMadreEntityManager.query(
      `SELECT unique_key FROM ${TABLE} WHERE unique_key IN (${inPlaceholders})`,
      keys
    );
    const existing = new Set(existingRows.map(row => row.unique_key));
    const inserted = new Set(keys.filter(key => !existing.has(key))).size;

    const rowPlaceholder = `(${INSERT_COLUMNS.map(() => '?').join(', ')})`;
    const values = orders.map(() => rowPlaceholder).join(',\n');

    const query = `
      INSERT INTO ${TABLE} (${INSERT_COLUMNS.join(', ')})
      VALUES ${values}
      ON DUPLICATE KEY UPDATE unique_key = unique_key
    `;

    const params = orders.flatMap(order => [
      order.marketplace,
      order.external_order_id,
      order.external_suborder_id ?? null,
      order.unique_key,
      this.toMysqlDateTime(order.purchase_date),
      order.customer_name ?? null,
      order.customer_document ?? null,
      order.customer_phone ?? null,
      order.customer_email ?? null,
      order.amount_total ?? null,
      order.currency ?? null,
      order.status ?? null,
      order.delivery_status ?? null,
      order.items_quantity ?? null,
      order.shipping_address ?? null,
      order.shipping_city ?? null,
      order.shipping_province ?? null,
      order.shipping_zip_code ?? null,
      JSON.stringify(order.source_payload ?? {}),
      order.normalized_payload ? JSON.stringify(order.normalized_payload) : null,
      order.source_schema_version ?? null
    ]);

    await this.productosMadreEntityManager.query(query, params);

    return {
      total: orders.length,
      inserted,
      skipped: orders.length - inserted
    };
  }

  async findByUniqueKey(uniqueKey: string): Promise<any> {
    const query = `
      SELECT ${SELECT_FIELDS}
      FROM ${TABLE}
      WHERE unique_key = ?
      LIMIT 1
    `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [uniqueKey]);

    if (!rows.length) {
      return null;
    }

    return this.hydrate(rows[0]);
  }

  async findPending(limit: number): Promise<any[]> {
    const query = `
      SELECT ${SELECT_FIELDS}
      FROM ${TABLE}
      WHERE persistence_status = 'PENDING'
      ORDER BY created_at ASC
      LIMIT ?
    `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [limit]);

    return rows.map(row => this.hydrate(row));
  }

  async updateStatus(id: number, data: UpdateOrderStatusDTO): Promise<boolean> {
    const sets: string[] = [];
    const params: any[] = [];

    const assign = (column: string, value: unknown) => {
      sets.push(`${column} = ?`);
      params.push(value);
    };

    if (data.persistence_status !== undefined) assign('persistence_status', data.persistence_status);
    if (data.notification_system_a_status !== undefined)
      assign('notification_system_a_status', data.notification_system_a_status);
    if (data.notification_system_b_status !== undefined)
      assign('notification_system_b_status', data.notification_system_b_status);
    if (data.floxu_code !== undefined) assign('floxu_code', data.floxu_code);
    if (data.last_error !== undefined) assign('last_error', data.last_error);

    sets.push('last_processed_at = NOW()');

    const query = `
      UPDATE ${TABLE}
      SET ${sets.join(', ')}
      WHERE id = ?
    `;

    params.push(id);

    const result: any = await this.productosMadreEntityManager.query(query, params);

    return Number(result.affectedRows ?? 0) > 0;
  }

  private hydrate(row: any): any {
    return {
      ...row,
      id: Number(row.id),
      amount_total: row.amount_total === null ? null : Number(row.amount_total),
      items_quantity: row.items_quantity === null ? null : Number(row.items_quantity),
      source_payload: this.parseJsonField(row.source_payload),
      normalized_payload: this.parseJsonField(row.normalized_payload)
    };
  }

  private parseJsonField(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value ?? null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private toMysqlDateTime(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}
