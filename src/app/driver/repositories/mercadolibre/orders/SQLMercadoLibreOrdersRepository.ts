import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ISQLMercadoLibreOrdersRepository,
  MercadoLibreOrderAporteMlSummary,
  MercadoLibreOrderWithAporteMl
} from 'src/core/adapters/repositories/mercadolibre/orders/ISQLMercadoLibreOrdersRepository';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

@Injectable()
export class SQLMercadoLibreOrdersRepository implements ISQLMercadoLibreOrdersRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async findOrdersWithAporteMl(params: {
    limit: number;
    offset: number;
    fromDate: string;
    status?: string;
  }): Promise<PaginatedResult<MercadoLibreOrderWithAporteMl>> {
    const { whereClause, whereParams } = this.buildAporteMlWhereClause({
      fromDate: params.fromDate,
      status: params.status
    });

    const rows = await this.entityManager.query(
      `
        SELECT
          id,
          tipo_venta,
          envio_domestico,
          nro_venta,
          payment_id,
          flokzu_identifier,
          sku,
          estado_orden,
          fecha_venta,
          fecha_entrega,
          nombre_producto,
          link_ml,
          link_amazon,
          cantidad_unidades,
          precio_venta,
          saldo_mercadolibre,
          comision_ml,
          cuotas_ml,
          aporte_ml,
          costo_envio,
          impuestos,
          cuit_comprador,
          nombre_destinatario,
          direccion_cliente,
          ciudad,
          provincia,
          codigo_postal,
          buyer_id,
          created_at,
          updated_at
        FROM orders
        ${whereClause}
        ORDER BY fecha_venta DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...whereParams, params.limit, params.offset]
    );

    const total = await this.countByWhereClause(whereClause, whereParams);

    return this.buildPaginatedResult(
      rows.map((row: any) => this.mapOrderRow(row)),
      total,
      params.limit,
      params.offset
    );
  }

  async findOrderAporteMlSummaries(params: {
    limit: number;
    offset: number;
    fromDate: string;
    toDate?: string;
    status?: string;
  }): Promise<PaginatedResult<MercadoLibreOrderAporteMlSummary>> {
    const { whereClause, whereParams } = this.buildAporteMlWhereClause({
      fromDate: params.fromDate,
      toDate: params.toDate,
      status: params.status
    });

    const rows = await this.entityManager.query(
      `
        SELECT
          nro_venta,
          aporte_ml,
          fecha_venta
        FROM orders
        ${whereClause}
        ORDER BY fecha_venta DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...whereParams, params.limit, params.offset]
    );

    const total = await this.countByWhereClause(whereClause, whereParams);

    return this.buildPaginatedResult(
      rows.map((row: any) => ({
        nroVenta: row.nro_venta ?? null,
        aporteMl: this.toNumberOrNull(row.aporte_ml),
        fechaVenta: row.fecha_venta ? new Date(row.fecha_venta).toISOString() : null
      })),
      total,
      params.limit,
      params.offset
    );
  }

  private buildAporteMlWhereClause(params: { fromDate: string; toDate?: string; status?: string }) {
    const whereParts = ['aporte_ml IS NOT NULL', 'fecha_venta >= ?'];
    const whereParams: any[] = [params.fromDate];

    if (params.toDate) {
      whereParts.push('fecha_venta <= ?');
      whereParams.push(params.toDate);
    }

    if (params.status) {
      whereParts.push('LOWER(estado_orden) = ?');
      whereParams.push(params.status.toLowerCase());
    }

    return {
      whereClause: `WHERE ${whereParts.join(' AND ')}`,
      whereParams
    };
  }

  private async countByWhereClause(whereClause: string, whereParams: any[]): Promise<number> {
    const countRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM orders
        ${whereClause}
      `,
      whereParams
    );

    return Number(countRows?.[0]?.total ?? 0);
  }

  private buildPaginatedResult<T>(
    items: T[],
    total: number,
    limit: number,
    offset: number
  ): PaginatedResult<T> {
    return {
      items,
      total,
      limit,
      offset,
      count: items.length,
      hasNext: offset + limit < total,
      nextOffset: offset + limit < total ? offset + limit : null
    };
  }

  private mapOrderRow(row: any): MercadoLibreOrderWithAporteMl {
    return {
      id: Number(row.id),
      tipoVenta: row.tipo_venta ?? null,
      envioDomestico: row.envio_domestico ?? null,
      nroVenta: row.nro_venta ?? null,
      paymentId: row.payment_id ?? null,
      flokzuIdentifier: row.flokzu_identifier ?? null,
      sku: row.sku ?? null,
      estadoOrden: row.estado_orden ?? null,
      fechaVenta: row.fecha_venta ? new Date(row.fecha_venta).toISOString() : null,
      fechaEntrega: row.fecha_entrega ? new Date(row.fecha_entrega).toISOString() : null,
      nombreProducto: row.nombre_producto ?? null,
      linkMl: row.link_ml ?? null,
      linkAmazon: row.link_amazon ?? null,
      cantidadUnidades: this.toNumberOrNull(row.cantidad_unidades),
      precioVenta: this.toNumberOrNull(row.precio_venta),
      saldoMercadolibre: this.toNumberOrNull(row.saldo_mercadolibre),
      comisionMl: this.toNumberOrNull(row.comision_ml),
      cuotasMl: this.toNumberOrNull(row.cuotas_ml),
      aporteMl: this.toNumberOrNull(row.aporte_ml),
      costoEnvio: this.toNumberOrNull(row.costo_envio),
      impuestos: this.toNumberOrNull(row.impuestos),
      cuitComprador: row.cuit_comprador ?? null,
      nombreDestinatario: row.nombre_destinatario ?? null,
      direccionCliente: row.direccion_cliente ?? null,
      ciudad: row.ciudad ?? null,
      provincia: row.provincia ?? null,
      codigoPostal: row.codigo_postal ?? null,
      buyerId: row.buyer_id ?? null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
    };
  }

  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
