import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IProductDeltaRepository } from 'src/core/adapters/repositories/madre/delta/IProductDeltaRepository';
import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

@Injectable()
export class SQLProductDeltaRepository implements IProductDeltaRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async findChangesAfterId(afterId: number, limit: number): Promise<ProductDelta[]> {
    const rows = await this.entityManager.query(
      `SELECT
        id,
        producto_id,
        sku,
        campo,
        valor_anterior,
        valor_nuevo,
        operacion,
        origen,
        lote_id,
        hash_idem,
        created_at
      FROM defaultdb.productos_madre_delta
      WHERE id > ?
      ORDER BY id ASC
      LIMIT ?`,
      [afterId, limit]
    );

    return rows.map((row: any) => this.mapRowToDelta(row));
  }

  async getRecentChangesSummary(minutes: number): Promise<{
    minutes: number;
    totalChanges: number;
    totalProducts: number;
    lastChangeAt: Date | null;
  }> {
    const safeMinutes = Math.max(1, Math.min(7 * 24 * 60, Math.trunc(Number(minutes) || 0)));

    const rows = await this.entityManager.query(
      `SELECT
        COUNT(*) AS total_changes,
        COUNT(DISTINCT producto_id) AS total_products,
        MAX(created_at) AS last_change_at
      FROM defaultdb.productos_madre_delta
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeMinutes} MINUTE)`
    );

    const row = rows[0] ?? {};

    return {
      minutes: safeMinutes,
      totalChanges: Number(row.total_changes ?? 0),
      totalProducts: Number(row.total_products ?? 0),
      lastChangeAt: row.last_change_at ? new Date(row.last_change_at) : null
    };
  }

  async getRecentlyUpdatedProducts(
    minutes: number,
    limit: number,
    offset: number
  ): Promise<{
    items: Array<{
      productoId: number;
      sku: string;
      changesCount: number;
      lastChangeAt: Date | null;
      fields: string[];
    }>;
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    nextOffset: number | null;
  }> {
    const safeMinutes = Math.max(1, Math.min(7 * 24 * 60, Math.trunc(Number(minutes) || 0)));
    const safeLimit = Math.min(5000, Math.max(1, Math.trunc(Number(limit) || 100)));
    const safeOffset = Math.max(0, Math.trunc(Number(offset) || 0));

    const rows = await this.entityManager.query(
      `SELECT
        producto_id,
        MAX(sku) AS sku,
        COUNT(*) AS changes_count,
        MAX(created_at) AS last_change_at,
        GROUP_CONCAT(DISTINCT campo ORDER BY campo SEPARATOR ',') AS fields
      FROM defaultdb.productos_madre_delta
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeMinutes} MINUTE)
      GROUP BY producto_id
      ORDER BY last_change_at DESC, producto_id DESC
      LIMIT ? OFFSET ?`,
      [safeLimit, safeOffset]
    );

    const countRows = await this.entityManager.query(
      `SELECT COUNT(*) AS total
      FROM (
        SELECT producto_id
        FROM defaultdb.productos_madre_delta
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${safeMinutes} MINUTE)
        GROUP BY producto_id
      ) grouped_products`
    );

    const total = Number(countRows[0]?.total ?? 0);
    const hasNext = safeOffset + safeLimit < total;

    return {
      items: rows.map((row: any) => ({
        productoId: Number(row.producto_id),
        sku: String(row.sku ?? ''),
        changesCount: Number(row.changes_count ?? 0),
        lastChangeAt: row.last_change_at ? new Date(row.last_change_at) : null,
        fields: String(row.fields ?? '')
          .split(',')
          .map((field: string) => field.trim())
          .filter(Boolean)
      })),
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasNext,
      nextOffset: hasNext ? safeOffset + safeLimit : null
    };
  }

  private mapRowToDelta(row: any): ProductDelta {
    return {
      id: Number(row.id),
      productoId: row.producto_id,
      sku: row.sku,
      campo: row.campo,
      valorAnterior: row.valor_anterior ?? null,
      valorNuevo: row.valor_nuevo ?? null,
      operacion: row.operacion,
      origen: row.origen,
      loteId: row.lote_id ?? null,
      hashIdem: row.hash_idem ?? null,
      createdAt: new Date(row.created_at)
    };
  }
}
