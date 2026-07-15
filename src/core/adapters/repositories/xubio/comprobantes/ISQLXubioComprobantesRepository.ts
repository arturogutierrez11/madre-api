export interface XubioComprobanteProductItemInput {
  transaccionCvItemId?: number | null;
  productoId?: number | null;
  productoCodigo?: string | null;
  productoNombre?: string | null;
  depositoId?: number | null;
  depositoCodigo?: string | null;
  depositoNombre?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
  precio?: number | null;
  importe?: number | null;
  iva?: number | null;
  total?: number | null;
  precioConIvaIncluido?: number | null;
  montoExento?: number | null;
  porcentajeDescuento?: number | null;
  rawPayload: unknown;
}

export interface XubioComprobanteCobranzaItemInput {
  itemId?: number | null;
  cuentaTipo?: string | null;
  cuentaId?: number | null;
  monedaId?: number | null;
  monedaCodigo?: string | null;
  monedaNombre?: string | null;
  cotizacionMonedaTransaccion?: number | null;
  importeMonedaPrincipal?: number | null;
  importeMonedaTransaccion?: number | null;
  descripcion?: string | null;
  rawPayload: unknown;
}

export interface XubioComprobantePercepcionItemInput {
  itemId?: number | null;
  descripcion?: string | null;
  importe?: number | null;
  rawPayload: unknown;
}

export interface XubioComprobanteInput {
  syncRunId?: number | null;
  source?: 'api' | 'excel' | 'manual';
  xubioTransactionId: number;
  externalId?: string | null;
  numeroDocumento?: string | null;
  tipoCodigo?: number | null;
  tipoNombre?: string | null;
  documentKind?: 'INVOICE' | 'CREDIT_NOTE' | 'FCE' | 'UNKNOWN';
  letraComprobante?: string | null;
  descripcion?: string | null;
  tlqvCode?: string | null;
  tlqvNumber?: number | null;
  mlOrderId?: string | null;
  fechaEmision: string;
  fechaVencimiento?: string | null;
  importeGravado?: number | null;
  importeImpuestos?: number | null;
  importeTotal?: number | null;
  importeMonedaPrincipal?: number | null;
  monedaId?: number | null;
  monedaCodigo?: string | null;
  monedaNombre?: string | null;
  cotizacion?: number | null;
  cotizacionListaPrecio?: number | null;
  circuitoContableId?: number | null;
  circuitoContableCodigo?: string | null;
  circuitoContableNombre?: string | null;
  depositoId?: number | null;
  depositoCodigo?: string | null;
  depositoNombre?: string | null;
  condicionPago?: number | null;
  porcentajeComision?: number | null;
  puntoVentaId?: number | null;
  puntoVentaCodigo?: string | null;
  puntoVentaNombre?: string | null;
  clienteXubioId?: number | null;
  clienteCodigo?: string | null;
  clienteNombre?: string | null;
  provinciaId?: number | null;
  provinciaCodigo?: string | null;
  provinciaNombre?: string | null;
  facturaNoExportacion?: boolean | null;
  cbuInformada?: boolean | null;
  mailEstado?: string | null;
  cae?: string | null;
  caeFechaVencimiento?: string | null;
  fiscalmenteEmitido?: boolean | null;
  rawListPayload?: unknown;
  rawDetailPayload: unknown;
  syncedAt?: string | null;
  productItems?: XubioComprobanteProductItemInput[];
  cobranzaItems?: XubioComprobanteCobranzaItemInput[];
  percepcionItems?: XubioComprobantePercepcionItemInput[];
}

export interface UpsertXubioComprobantesResult {
  total: number;
  inserted: number;
  updated: number;
}

export interface XubioComprobanteSyncRunInput {
  syncType: 'historical_backfill' | 'daily_update' | 'manual_retry';
  status: 'running' | 'completed' | 'failed' | 'partial';
  fechaDesde: string;
  fechaHasta: string;
  windowType: 'month' | 'day' | 'custom';
  totalListed?: number;
  totalDetailRequests?: number;
  totalInserted?: number;
  totalUpdated?: number;
  totalFailed?: number;
  hasSaturatedWindows?: boolean;
  errorMessage?: string | null;
  metadata?: unknown;
  finishedAt?: string | null;
}

export interface XubioComprobanteSyncRunRecord {
  id: number;
  syncType: string;
  status: string;
  fechaDesde: string;
  fechaHasta: string;
  windowType: string;
  totalListed: number;
  totalDetailRequests: number;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  hasSaturatedWindows: boolean;
  errorMessage: string | null;
  metadata: unknown;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface XubioComprobanteRecord {
  id: number;
  syncRunId: number | null;
  source: string;
  xubioTransactionId: number;
  externalId: string | null;
  numeroDocumento: string | null;
  tipoCodigo: number | null;
  tipoNombre: string;
  documentKind: string;
  letraComprobante: string | null;
  descripcion: string;
  tlqvCode: string | null;
  tlqvNumber: number | null;
  mlOrderId: string | null;
  fechaEmision: string;
  fechaVencimiento: string | null;
  importeGravado: number;
  importeImpuestos: number;
  importeTotal: number;
  importeMonedaPrincipal: number | null;
  monedaId: number | null;
  monedaCodigo: string | null;
  monedaNombre: string | null;
  cotizacion: number | null;
  cotizacionListaPrecio: number | null;
  circuitoContableId: number | null;
  circuitoContableCodigo: string | null;
  circuitoContableNombre: string | null;
  depositoId: number | null;
  depositoCodigo: string | null;
  depositoNombre: string | null;
  condicionPago: number | null;
  porcentajeComision: number | null;
  puntoVentaId: number | null;
  puntoVentaCodigo: string | null;
  puntoVentaNombre: string | null;
  clienteXubioId: number | null;
  clienteCodigo: string | null;
  clienteNombre: string | null;
  provinciaId: number | null;
  provinciaCodigo: string | null;
  provinciaNombre: string | null;
  facturaNoExportacion: boolean | null;
  cbuInformada: boolean | null;
  mailEstado: string | null;
  cae: string | null;
  caeFechaVencimiento: string | null;
  fiscalmenteEmitido: boolean;
  rawListPayload: unknown;
  rawDetailPayload: unknown;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
  productItems: Array<Record<string, unknown>>;
  cobranzaItems: Array<Record<string, unknown>>;
  percepcionItems: Array<Record<string, unknown>>;
}

export interface XubioComprobanteExistsByTlqvCodeRecord {
  tlqvCode: string;
  exists: boolean;
}

export interface ISQLXubioComprobantesRepository {
  createSyncRun(input: XubioComprobanteSyncRunInput): Promise<XubioComprobanteSyncRunRecord>;
  updateSyncRun(id: number, input: Partial<XubioComprobanteSyncRunInput>): Promise<XubioComprobanteSyncRunRecord | null>;
  findSyncRunById(id: number): Promise<XubioComprobanteSyncRunRecord | null>;
  upsertComprobantes(items: XubioComprobanteInput[]): Promise<UpsertXubioComprobantesResult>;
  findByTlqvCode(tlqvCode: string): Promise<XubioComprobanteRecord[]>;
  findByTlqvCodes(tlqvCodes: string[]): Promise<XubioComprobanteRecord[]>;
  existsByTlqvCode(tlqvCode: string): Promise<XubioComprobanteExistsByTlqvCodeRecord>;
  existsByTlqvCodes(tlqvCodes: string[]): Promise<XubioComprobanteExistsByTlqvCodeRecord[]>;
  listComprobantes(filters: {
    tlqvCode?: string;
    numeroDocumento?: string;
    clienteCodigo?: string;
    mlOrderId?: string;
    documentKind?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    includeChildren?: boolean;
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
  }>;
  findExistingClients(clientCodes: string[]): Promise<Array<{
    clienteCodigo: string;
    clienteXubioId: number | null;
    clienteNombre: string | null;
  }>>;
}
