export interface ProductDelta {
  id: number;
  productoId: number;
  sku: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  operacion: string;
  origen: string;
  loteId: string | null;
  hashIdem: string | null;
  createdAt: Date;
}
