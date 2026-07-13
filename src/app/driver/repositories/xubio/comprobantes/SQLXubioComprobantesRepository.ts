import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ISQLXubioComprobantesRepository,
  XubioComprobanteExistsByTlqvCodeRecord,
  UpsertXubioComprobantesResult,
  XubioComprobanteInput,
  XubioComprobanteRecord,
  XubioComprobanteSyncRunInput,
  XubioComprobanteSyncRunRecord
} from 'src/core/adapters/repositories/xubio/comprobantes/ISQLXubioComprobantesRepository';

type GenericRow = Record<string, any>;

@Injectable()
export class SQLXubioComprobantesRepository implements ISQLXubioComprobantesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async createSyncRun(input: XubioComprobanteSyncRunInput): Promise<XubioComprobanteSyncRunRecord> {
    const result: any = await this.entityManager.query(
      `
        INSERT INTO defaultdb.xubio_comprobante_sync_runs (
          sync_type, status, fecha_desde, fecha_hasta, window_type,
          total_listed, total_detail_requests, total_inserted, total_updated, total_failed,
          has_saturated_windows, error_message, metadata, finished_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.syncType,
        input.status,
        this.toMysqlDate(input.fechaDesde),
        this.toMysqlDate(input.fechaHasta),
        input.windowType,
        input.totalListed ?? 0,
        input.totalDetailRequests ?? 0,
        input.totalInserted ?? 0,
        input.totalUpdated ?? 0,
        input.totalFailed ?? 0,
        input.hasSaturatedWindows ? 1 : 0,
        input.errorMessage ?? null,
        this.stringifyJson(input.metadata ?? {}),
        this.toMysqlDateTime(input.finishedAt ?? null)
      ]
    );

    return (await this.findSyncRunById(Number(result.insertId)))!;
  }

  async updateSyncRun(
    id: number,
    input: Partial<XubioComprobanteSyncRunInput>
  ): Promise<XubioComprobanteSyncRunRecord | null> {
    const updates: string[] = [];
    const params: any[] = [];

    const assign = (column: string, value: unknown) => {
      updates.push(`${column} = ?`);
      params.push(value);
    };

    if (input.syncType !== undefined) assign('sync_type', input.syncType);
    if (input.status !== undefined) assign('status', input.status);
    if (input.fechaDesde !== undefined) assign('fecha_desde', this.toMysqlDate(input.fechaDesde));
    if (input.fechaHasta !== undefined) assign('fecha_hasta', this.toMysqlDate(input.fechaHasta));
    if (input.windowType !== undefined) assign('window_type', input.windowType);
    if (input.totalListed !== undefined) assign('total_listed', input.totalListed);
    if (input.totalDetailRequests !== undefined) assign('total_detail_requests', input.totalDetailRequests);
    if (input.totalInserted !== undefined) assign('total_inserted', input.totalInserted);
    if (input.totalUpdated !== undefined) assign('total_updated', input.totalUpdated);
    if (input.totalFailed !== undefined) assign('total_failed', input.totalFailed);
    if (input.hasSaturatedWindows !== undefined) assign('has_saturated_windows', input.hasSaturatedWindows ? 1 : 0);
    if (input.errorMessage !== undefined) assign('error_message', input.errorMessage);
    if (input.metadata !== undefined) assign('metadata', this.stringifyJson(input.metadata));
    if (input.finishedAt !== undefined) assign('finished_at', this.toMysqlDateTime(input.finishedAt));

    updates.push('updated_at = NOW()');

    const result: any = await this.entityManager.query(
      `
        UPDATE defaultdb.xubio_comprobante_sync_runs
        SET ${updates.join(', ')}
        WHERE id = ?
      `,
      [...params, id]
    );

    if (Number(result.affectedRows ?? 0) === 0) {
      return null;
    }

    return this.findSyncRunById(id);
  }

  async findSyncRunById(id: number): Promise<XubioComprobanteSyncRunRecord | null> {
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.xubio_comprobante_sync_runs
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return null;
    }

    return this.mapSyncRun(rows[0]);
  }

  async upsertComprobantes(items: XubioComprobanteInput[]): Promise<UpsertXubioComprobantesResult> {
    const transactionIds = [...new Set(items.map(item => Number(item.xubioTransactionId)).filter(Boolean))];
    const existing = await this.findExistingTransactionIds(transactionIds);

    await this.entityManager.transaction(async manager => {
      for (const item of items) {
        const comprobanteId = await this.upsertComprobante(manager, item);
        await this.replaceProductItems(manager, comprobanteId, item);
        await this.replaceCobranzaItems(manager, comprobanteId, item);
        await this.replacePercepcionItems(manager, comprobanteId, item);
      }
    });

    return {
      total: items.length,
      inserted: items.filter(item => !existing.has(Number(item.xubioTransactionId))).length,
      updated: items.filter(item => existing.has(Number(item.xubioTransactionId))).length
    };
  }

  async findByTlqvCode(tlqvCode: string): Promise<XubioComprobanteRecord[]> {
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.xubio_comprobantes
        WHERE tlqv_code = ?
        ORDER BY fecha_emision DESC, id DESC
      `,
      [tlqvCode]
    );

    return this.hydrateComprobantes(rows);
  }

  async findByTlqvCodes(tlqvCodes: string[]): Promise<XubioComprobanteRecord[]> {
    if (!tlqvCodes.length) {
      return [];
    }

    const placeholders = tlqvCodes.map(() => '?').join(', ');
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.xubio_comprobantes
        WHERE tlqv_code IN (${placeholders})
        ORDER BY fecha_emision DESC, id DESC
      `,
      tlqvCodes
    );

    return this.hydrateComprobantes(rows);
  }

  async existsByTlqvCode(tlqvCode: string): Promise<XubioComprobanteExistsByTlqvCodeRecord> {
    const rows = await this.entityManager.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM defaultdb.xubio_comprobantes
          WHERE tlqv_code = ?
            AND document_kind = 'INVOICE'
            AND tipo_codigo = 1
            AND cae IS NOT NULL
            AND cae <> ''
          LIMIT 1
        ) AS exists_value
      `,
      [tlqvCode]
    );

    return {
      tlqvCode,
      exists: Number(rows[0]?.exists_value ?? 0) === 1
    };
  }

  async existsByTlqvCodes(tlqvCodes: string[]): Promise<XubioComprobanteExistsByTlqvCodeRecord[]> {
    if (!tlqvCodes.length) {
      return [];
    }

    const placeholders = tlqvCodes.map(() => '?').join(', ');
    const rows = await this.entityManager.query(
      `
        SELECT
          tlqv_code,
          COUNT(*) > 0 AS exists_value
        FROM defaultdb.xubio_comprobantes
        WHERE tlqv_code IN (${placeholders})
          AND document_kind = 'INVOICE'
          AND tipo_codigo = 1
          AND cae IS NOT NULL
          AND cae <> ''
        GROUP BY tlqv_code
      `,
      tlqvCodes
    );

    const found = new Map<string, boolean>(
      rows.map((row: GenericRow) => [String(row.tlqv_code), Number(row.exists_value ?? 0) === 1])
    );

    return tlqvCodes.map(tlqvCode => ({
      tlqvCode,
      exists: found.get(tlqvCode) ?? false
    }));
  }

  async listComprobantes(filters: {
    tlqvCode?: string | undefined;
    numeroDocumento?: string | undefined;
    clienteCodigo?: string | undefined;
    mlOrderId?: string | undefined;
    documentKind?: string | undefined;
    fechaDesde?: string | undefined;
    fechaHasta?: string | undefined;
    limit: number;
    offset: number;
  }): Promise<{
    items: XubioComprobanteRecord[];
    total: number;
    limit: number;
    offset: number;
    count: number;
    hasNext: boolean;
    nextOffset: number | null;
  }> {
    const where: string[] = [];
    const params: any[] = [];

    this.pushEquals(where, params, 'tlqv_code', filters.tlqvCode);
    this.pushEquals(where, params, 'numero_documento', filters.numeroDocumento);
    this.pushEquals(where, params, 'cliente_codigo', filters.clienteCodigo);
    this.pushEquals(where, params, 'ml_order_id', filters.mlOrderId);
    this.pushEquals(where, params, 'document_kind', filters.documentKind);
    this.pushDateRange(where, params, 'fecha_emision', filters.fechaDesde, filters.fechaHasta);

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.xubio_comprobantes
        ${whereClause}
        ORDER BY fecha_emision DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, filters.limit, filters.offset]
    );

    const totalRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM defaultdb.xubio_comprobantes
        ${whereClause}
      `,
      params
    );

    const items = await this.hydrateComprobantes(rows);
    const total = Number(totalRows[0]?.total ?? 0);
    const hasNext = filters.offset + filters.limit < total;

    return {
      items,
      total,
      limit: filters.limit,
      offset: filters.offset,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? filters.offset + filters.limit : null
    };
  }

  async findExistingClients(clientCodes: string[]): Promise<Array<{
    clienteCodigo: string;
    clienteXubioId: number | null;
    clienteNombre: string | null;
  }>> {
    if (!clientCodes.length) {
      return [];
    }

    const placeholders = clientCodes.map(() => '?').join(', ');
    const rows = await this.entityManager.query(
      `
        SELECT
          cliente_codigo,
          MAX(cliente_xubio_id) AS cliente_xubio_id,
          MAX(cliente_nombre) AS cliente_nombre
        FROM defaultdb.xubio_comprobantes
        WHERE cliente_codigo IN (${placeholders})
        GROUP BY cliente_codigo
        ORDER BY cliente_codigo ASC
      `,
      clientCodes
    );

    return rows.map((row: GenericRow) => ({
      clienteCodigo: String(row.cliente_codigo),
      clienteXubioId: row.cliente_xubio_id != null ? Number(row.cliente_xubio_id) : null,
      clienteNombre: row.cliente_nombre ?? null
    }));
  }

  private async findExistingTransactionIds(transactionIds: number[]): Promise<Set<number>> {
    if (!transactionIds.length) {
      return new Set<number>();
    }

    const placeholders = transactionIds.map(() => '?').join(', ');
    const rows = await this.entityManager.query(
      `
        SELECT xubio_transaction_id
        FROM defaultdb.xubio_comprobantes
        WHERE xubio_transaction_id IN (${placeholders})
      `,
      transactionIds
    );

    return new Set(rows.map((row: GenericRow) => Number(row.xubio_transaction_id)));
  }

  private async upsertComprobante(manager: EntityManager, item: XubioComprobanteInput): Promise<number> {
    await manager.query(
      `
        INSERT INTO defaultdb.xubio_comprobantes (
          sync_run_id, source, xubio_transaction_id, external_id, numero_documento,
          tipo_codigo, tipo_nombre, document_kind, letra_comprobante,
          descripcion, tlqv_code, tlqv_number, ml_order_id,
          fecha_emision, fecha_vencimiento,
          importe_gravado, importe_impuestos, importe_total, importe_moneda_principal,
          moneda_id, moneda_codigo, moneda_nombre, cotizacion, cotizacion_lista_precio,
          circuito_contable_id, circuito_contable_codigo, circuito_contable_nombre,
          deposito_id, deposito_codigo, deposito_nombre,
          condicion_pago, porcentaje_comision,
          punto_venta_id, punto_venta_codigo, punto_venta_nombre,
          cliente_xubio_id, cliente_codigo, cliente_nombre,
          provincia_id, provincia_codigo, provincia_nombre,
          factura_no_exportacion, cbu_informada, mail_estado,
          cae, cae_fecha_vencimiento, fiscalmente_emitido,
          raw_list_payload, raw_detail_payload, synced_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          sync_run_id = VALUES(sync_run_id),
          source = VALUES(source),
          external_id = VALUES(external_id),
          numero_documento = VALUES(numero_documento),
          tipo_codigo = VALUES(tipo_codigo),
          tipo_nombre = VALUES(tipo_nombre),
          document_kind = VALUES(document_kind),
          letra_comprobante = VALUES(letra_comprobante),
          descripcion = VALUES(descripcion),
          tlqv_code = VALUES(tlqv_code),
          tlqv_number = VALUES(tlqv_number),
          ml_order_id = VALUES(ml_order_id),
          fecha_emision = VALUES(fecha_emision),
          fecha_vencimiento = VALUES(fecha_vencimiento),
          importe_gravado = VALUES(importe_gravado),
          importe_impuestos = VALUES(importe_impuestos),
          importe_total = VALUES(importe_total),
          importe_moneda_principal = VALUES(importe_moneda_principal),
          moneda_id = VALUES(moneda_id),
          moneda_codigo = VALUES(moneda_codigo),
          moneda_nombre = VALUES(moneda_nombre),
          cotizacion = VALUES(cotizacion),
          cotizacion_lista_precio = VALUES(cotizacion_lista_precio),
          circuito_contable_id = VALUES(circuito_contable_id),
          circuito_contable_codigo = VALUES(circuito_contable_codigo),
          circuito_contable_nombre = VALUES(circuito_contable_nombre),
          deposito_id = VALUES(deposito_id),
          deposito_codigo = VALUES(deposito_codigo),
          deposito_nombre = VALUES(deposito_nombre),
          condicion_pago = VALUES(condicion_pago),
          porcentaje_comision = VALUES(porcentaje_comision),
          punto_venta_id = VALUES(punto_venta_id),
          punto_venta_codigo = VALUES(punto_venta_codigo),
          punto_venta_nombre = VALUES(punto_venta_nombre),
          cliente_xubio_id = VALUES(cliente_xubio_id),
          cliente_codigo = VALUES(cliente_codigo),
          cliente_nombre = VALUES(cliente_nombre),
          provincia_id = VALUES(provincia_id),
          provincia_codigo = VALUES(provincia_codigo),
          provincia_nombre = VALUES(provincia_nombre),
          factura_no_exportacion = VALUES(factura_no_exportacion),
          cbu_informada = VALUES(cbu_informada),
          mail_estado = VALUES(mail_estado),
          cae = VALUES(cae),
          cae_fecha_vencimiento = VALUES(cae_fecha_vencimiento),
          fiscalmente_emitido = VALUES(fiscalmente_emitido),
          raw_list_payload = VALUES(raw_list_payload),
          raw_detail_payload = VALUES(raw_detail_payload),
          synced_at = VALUES(synced_at),
          updated_at = NOW()
      `,
      [
        item.syncRunId ?? null,
        item.source ?? 'api',
        item.xubioTransactionId,
        item.externalId ?? null,
        item.numeroDocumento ?? null,
        item.tipoCodigo ?? null,
        item.tipoNombre ?? 'UNKNOWN',
        item.documentKind ?? 'UNKNOWN',
        item.letraComprobante ?? null,
        item.descripcion ?? '',
        item.tlqvCode ?? null,
        item.tlqvNumber ?? null,
        item.mlOrderId ?? null,
        this.toMysqlDate(item.fechaEmision),
        this.toMysqlDate(item.fechaVencimiento ?? null),
        item.importeGravado ?? 0,
        item.importeImpuestos ?? 0,
        item.importeTotal ?? 0,
        item.importeMonedaPrincipal ?? null,
        item.monedaId ?? null,
        item.monedaCodigo ?? null,
        item.monedaNombre ?? null,
        item.cotizacion ?? null,
        item.cotizacionListaPrecio ?? null,
        item.circuitoContableId ?? null,
        item.circuitoContableCodigo ?? null,
        item.circuitoContableNombre ?? null,
        item.depositoId ?? null,
        item.depositoCodigo ?? null,
        item.depositoNombre ?? null,
        item.condicionPago ?? null,
        item.porcentajeComision ?? null,
        item.puntoVentaId ?? null,
        item.puntoVentaCodigo ?? null,
        item.puntoVentaNombre ?? null,
        item.clienteXubioId ?? null,
        item.clienteCodigo ?? null,
        item.clienteNombre ?? null,
        item.provinciaId ?? null,
        item.provinciaCodigo ?? null,
        item.provinciaNombre ?? null,
        this.toTinyint(item.facturaNoExportacion),
        this.toTinyint(item.cbuInformada),
        item.mailEstado ?? null,
        item.cae ?? null,
        this.toMysqlDate(item.caeFechaVencimiento ?? null),
        this.toTinyint(item.fiscalmenteEmitido) ?? 0,
        item.rawListPayload != null ? this.stringifyJson(item.rawListPayload) : null,
        this.stringifyJson(item.rawDetailPayload),
        this.toMysqlDateTime(item.syncedAt ?? null) ?? this.toMysqlDateTime(new Date().toISOString())
      ]
    );

    const rows = await manager.query(
      `
        SELECT id
        FROM defaultdb.xubio_comprobantes
        WHERE xubio_transaction_id = ?
        LIMIT 1
      `,
      [item.xubioTransactionId]
    );

    return Number(rows[0].id);
  }

  private async replaceProductItems(manager: EntityManager, comprobanteId: number, item: XubioComprobanteInput) {
    await manager.query(
      `DELETE FROM defaultdb.xubio_comprobante_product_items WHERE comprobante_id = ?`,
      [comprobanteId]
    );

    if (!item.productItems?.length) {
      return;
    }

    const placeholders = item.productItems.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = item.productItems.flatMap((productItem, index) => [
      comprobanteId,
      item.xubioTransactionId,
      index + 1,
      productItem.transaccionCvItemId ?? null,
      productItem.productoId ?? null,
      productItem.productoCodigo ?? null,
      productItem.productoNombre ?? null,
      productItem.depositoId ?? null,
      productItem.depositoCodigo ?? null,
      productItem.depositoNombre ?? null,
      productItem.descripcion ?? '',
      productItem.cantidad ?? 0,
      productItem.precio ?? 0,
      productItem.importe ?? 0,
      productItem.iva ?? 0,
      productItem.total ?? 0,
      productItem.precioConIvaIncluido ?? null,
      productItem.montoExento ?? null,
      productItem.porcentajeDescuento ?? null,
      this.stringifyJson(productItem.rawPayload)
    ]);

    await manager.query(
      `
        INSERT INTO defaultdb.xubio_comprobante_product_items (
          comprobante_id, xubio_transaction_id, line_number, transaccion_cv_item_id,
          producto_id, producto_codigo, producto_nombre,
          deposito_id, deposito_codigo, deposito_nombre,
          descripcion, cantidad, precio, importe, iva, total,
          precio_con_iva_incluido, monto_exento, porcentaje_descuento, raw_payload
        )
        VALUES ${placeholders}
      `,
      values
    );
  }

  private async replaceCobranzaItems(manager: EntityManager, comprobanteId: number, item: XubioComprobanteInput) {
    await manager.query(
      `DELETE FROM defaultdb.xubio_comprobante_cobranza_items WHERE comprobante_id = ?`,
      [comprobanteId]
    );

    if (!item.cobranzaItems?.length) {
      return;
    }

    const placeholders = item.cobranzaItems.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = item.cobranzaItems.flatMap((cobranzaItem, index) => [
      comprobanteId,
      item.xubioTransactionId,
      index + 1,
      cobranzaItem.itemId ?? null,
      cobranzaItem.cuentaTipo ?? null,
      cobranzaItem.cuentaId ?? null,
      cobranzaItem.monedaId ?? null,
      cobranzaItem.monedaCodigo ?? null,
      cobranzaItem.monedaNombre ?? null,
      cobranzaItem.cotizacionMonedaTransaccion ?? null,
      cobranzaItem.importeMonedaPrincipal ?? null,
      cobranzaItem.importeMonedaTransaccion ?? null,
      cobranzaItem.descripcion ?? '',
      this.stringifyJson(cobranzaItem.rawPayload)
    ]);

    await manager.query(
      `
        INSERT INTO defaultdb.xubio_comprobante_cobranza_items (
          comprobante_id, xubio_transaction_id, line_number, item_id,
          cuenta_tipo, cuenta_id, moneda_id, moneda_codigo, moneda_nombre,
          cotizacion_moneda_transaccion, importe_moneda_principal, importe_moneda_transaccion,
          descripcion, raw_payload
        )
        VALUES ${placeholders}
      `,
      values
    );
  }

  private async replacePercepcionItems(manager: EntityManager, comprobanteId: number, item: XubioComprobanteInput) {
    await manager.query(
      `DELETE FROM defaultdb.xubio_comprobante_percepcion_items WHERE comprobante_id = ?`,
      [comprobanteId]
    );

    if (!item.percepcionItems?.length) {
      return;
    }

    const placeholders = item.percepcionItems.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = item.percepcionItems.flatMap((percepcionItem, index) => [
      comprobanteId,
      item.xubioTransactionId,
      index + 1,
      percepcionItem.itemId ?? null,
      percepcionItem.descripcion ?? '',
      percepcionItem.importe ?? null,
      this.stringifyJson(percepcionItem.rawPayload)
    ]);

    await manager.query(
      `
        INSERT INTO defaultdb.xubio_comprobante_percepcion_items (
          comprobante_id, xubio_transaction_id, line_number, item_id,
          descripcion, importe, raw_payload
        )
        VALUES ${placeholders}
      `,
      values
    );
  }

  private async hydrateComprobantes(rows: GenericRow[]): Promise<XubioComprobanteRecord[]> {
    if (!rows.length) {
      return [];
    }

    const comprobanteIds = rows.map(row => Number(row.id));
    const placeholders = comprobanteIds.map(() => '?').join(', ');

    const [productItems, cobranzaItems, percepcionItems] = await Promise.all([
      this.entityManager.query(
        `SELECT * FROM defaultdb.xubio_comprobante_product_items WHERE comprobante_id IN (${placeholders}) ORDER BY comprobante_id ASC, line_number ASC`,
        comprobanteIds
      ),
      this.entityManager.query(
        `SELECT * FROM defaultdb.xubio_comprobante_cobranza_items WHERE comprobante_id IN (${placeholders}) ORDER BY comprobante_id ASC, line_number ASC`,
        comprobanteIds
      ),
      this.entityManager.query(
        `SELECT * FROM defaultdb.xubio_comprobante_percepcion_items WHERE comprobante_id IN (${placeholders}) ORDER BY comprobante_id ASC, line_number ASC`,
        comprobanteIds
      )
    ]);

    const productMap = this.groupByComprobanteId(productItems);
    const cobranzaMap = this.groupByComprobanteId(cobranzaItems);
    const percepcionMap = this.groupByComprobanteId(percepcionItems);

    return rows.map(row => ({
      id: Number(row.id),
      syncRunId: row.sync_run_id != null ? Number(row.sync_run_id) : null,
      source: row.source,
      xubioTransactionId: Number(row.xubio_transaction_id),
      externalId: row.external_id ?? null,
      numeroDocumento: row.numero_documento ?? null,
      tipoCodigo: row.tipo_codigo != null ? Number(row.tipo_codigo) : null,
      tipoNombre: row.tipo_nombre,
      documentKind: row.document_kind,
      letraComprobante: row.letra_comprobante ?? null,
      descripcion: row.descripcion ?? '',
      tlqvCode: row.tlqv_code ?? null,
      tlqvNumber: row.tlqv_number != null ? Number(row.tlqv_number) : null,
      mlOrderId: row.ml_order_id ?? null,
      fechaEmision: this.toIso(row.fecha_emision) ?? '',
      fechaVencimiento: this.toIso(row.fecha_vencimiento),
      importeGravado: Number(row.importe_gravado ?? 0),
      importeImpuestos: Number(row.importe_impuestos ?? 0),
      importeTotal: Number(row.importe_total ?? 0),
      importeMonedaPrincipal: row.importe_moneda_principal != null ? Number(row.importe_moneda_principal) : null,
      monedaId: row.moneda_id != null ? Number(row.moneda_id) : null,
      monedaCodigo: row.moneda_codigo ?? null,
      monedaNombre: row.moneda_nombre ?? null,
      cotizacion: row.cotizacion != null ? Number(row.cotizacion) : null,
      cotizacionListaPrecio: row.cotizacion_lista_precio != null ? Number(row.cotizacion_lista_precio) : null,
      circuitoContableId: row.circuito_contable_id != null ? Number(row.circuito_contable_id) : null,
      circuitoContableCodigo: row.circuito_contable_codigo ?? null,
      circuitoContableNombre: row.circuito_contable_nombre ?? null,
      depositoId: row.deposito_id != null ? Number(row.deposito_id) : null,
      depositoCodigo: row.deposito_codigo ?? null,
      depositoNombre: row.deposito_nombre ?? null,
      condicionPago: row.condicion_pago != null ? Number(row.condicion_pago) : null,
      porcentajeComision: row.porcentaje_comision != null ? Number(row.porcentaje_comision) : null,
      puntoVentaId: row.punto_venta_id != null ? Number(row.punto_venta_id) : null,
      puntoVentaCodigo: row.punto_venta_codigo ?? null,
      puntoVentaNombre: row.punto_venta_nombre ?? null,
      clienteXubioId: row.cliente_xubio_id != null ? Number(row.cliente_xubio_id) : null,
      clienteCodigo: row.cliente_codigo ?? null,
      clienteNombre: row.cliente_nombre ?? null,
      provinciaId: row.provincia_id != null ? Number(row.provincia_id) : null,
      provinciaCodigo: row.provincia_codigo ?? null,
      provinciaNombre: row.provincia_nombre ?? null,
      facturaNoExportacion: this.toBoolean(row.factura_no_exportacion),
      cbuInformada: this.toBoolean(row.cbu_informada),
      mailEstado: row.mail_estado ?? null,
      cae: row.cae ?? null,
      caeFechaVencimiento: this.toIso(row.cae_fecha_vencimiento),
      fiscalmenteEmitido: Boolean(row.fiscalmente_emitido),
      rawListPayload: this.parseJson(row.raw_list_payload),
      rawDetailPayload: this.parseJson(row.raw_detail_payload),
      syncedAt: this.toIso(row.synced_at) ?? new Date().toISOString(),
      createdAt: this.toIso(row.created_at) ?? new Date().toISOString(),
      updatedAt: this.toIso(row.updated_at) ?? new Date().toISOString(),
      productItems: productMap.get(Number(row.id)) ?? [],
      cobranzaItems: cobranzaMap.get(Number(row.id)) ?? [],
      percepcionItems: percepcionMap.get(Number(row.id)) ?? []
    }));
  }

  private groupByComprobanteId(rows: GenericRow[]) {
    const map = new Map<number, Array<Record<string, unknown>>>();

    for (const row of rows) {
      const comprobanteId = Number(row.comprobante_id);
      const current = map.get(comprobanteId) ?? [];
      current.push(this.hydrateChildRow(row));
      map.set(comprobanteId, current);
    }

    return map;
  }

  private hydrateChildRow(row: GenericRow): Record<string, unknown> {
    const hydrated: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (key === 'raw_payload') {
        hydrated.rawPayload = this.parseJson(value);
        continue;
      }

      hydrated[this.toCamelCase(key)] = value;
    }

    return hydrated;
  }

  private mapSyncRun(row: GenericRow): XubioComprobanteSyncRunRecord {
    return {
      id: Number(row.id),
      syncType: row.sync_type,
      status: row.status,
      fechaDesde: this.toIso(row.fecha_desde) ?? '',
      fechaHasta: this.toIso(row.fecha_hasta) ?? '',
      windowType: row.window_type,
      totalListed: Number(row.total_listed ?? 0),
      totalDetailRequests: Number(row.total_detail_requests ?? 0),
      totalInserted: Number(row.total_inserted ?? 0),
      totalUpdated: Number(row.total_updated ?? 0),
      totalFailed: Number(row.total_failed ?? 0),
      hasSaturatedWindows: Boolean(row.has_saturated_windows),
      errorMessage: row.error_message ?? null,
      metadata: this.parseJson(row.metadata),
      startedAt: this.toIso(row.started_at) ?? '',
      finishedAt: this.toIso(row.finished_at),
      createdAt: this.toIso(row.created_at) ?? '',
      updatedAt: this.toIso(row.updated_at) ?? ''
    };
  }

  private pushEquals(where: string[], params: any[], column: string, value?: string | null) {
    if (!value?.trim()) {
      return;
    }

    where.push(`${column} = ?`);
    params.push(value.trim());
  }

  private pushDateRange(where: string[], params: any[], column: string, from?: string, to?: string) {
    if (from?.trim()) {
      where.push(`${column} >= ?`);
      params.push(this.toMysqlDate(from));
    }

    if (to?.trim()) {
      where.push(`${column} <= ?`);
      params.push(this.toMysqlDate(to));
    }
  }

  private stringifyJson(value: unknown): string {
    return JSON.stringify(value ?? {});
  }

  private parseJson(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value ?? null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private toMysqlDate(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 10);
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

  private toIso(value: unknown): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value as string | number | Date);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private toTinyint(value: boolean | null | undefined): number | null {
    if (value == null) {
      return null;
    }

    return value ? 1 : 0;
  }

  private toBoolean(value: unknown): boolean | null {
    if (value == null) {
      return null;
    }

    return Boolean(Number(value));
  }

  private toCamelCase(value: string): string {
    return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
  }
}
