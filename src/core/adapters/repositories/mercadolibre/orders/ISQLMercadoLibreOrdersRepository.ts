import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';

export interface MercadoLibreOrderWithAporteMl {
  id: number;
  tipoVenta: string | null;
  envioDomestico: string | null;
  nroVenta: string | null;
  paymentId: string | null;
  flokzuIdentifier: string | null;
  sku: string | null;
  estadoOrden: string | null;
  fechaVenta: string | null;
  fechaEntrega: string | null;
  nombreProducto: string | null;
  linkMl: string | null;
  linkAmazon: string | null;
  cantidadUnidades: number | null;
  precioVenta: number | null;
  saldoMercadolibre: number | null;
  comisionMl: number | null;
  cuotasMl: number | null;
  aporteMl: number | null;
  costoEnvio: number | null;
  impuestos: number | null;
  cuitComprador: string | null;
  nombreDestinatario: string | null;
  direccionCliente: string | null;
  ciudad: string | null;
  provincia: string | null;
  codigoPostal: string | null;
  buyerId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MercadoLibreOrderAporteMlSummary {
  nroVenta: string | null;
  aporteMl: number | null;
  fechaVenta: string | null;
}

export interface ISQLMercadoLibreOrdersRepository {
  findOrdersWithAporteMl(params: {
    limit: number;
    offset: number;
    fromDate: string;
    status?: string;
  }): Promise<PaginatedResult<MercadoLibreOrderWithAporteMl>>;

  findOrderAporteMlSummaries(params: {
    limit: number;
    offset: number;
    fromDate: string;
    toDate?: string;
    status?: string;
  }): Promise<PaginatedResult<MercadoLibreOrderAporteMlSummary>>;
}
