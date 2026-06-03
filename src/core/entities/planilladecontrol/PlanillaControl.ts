export const PLANILLA_CONTROL_COLUMNS = [
  'identificador',
  'nombre_de_tarea',
  'fecha_amazon',
  'fecha_compra',
  'fecha_entrega',
  'fecha_venta',
  'nro_guia',
  'nro_venta',
  'transformador',
  'nombre_producto',
  'link_ml',
  'estado',
  'estado_envio',
  'etd',
  'obs_operaciones',
  'tipo_venta',
  'link_amazon',
  'n_pedido_amz',
  'peso_producto',
  'tracking_amazon',
  'cantidad_unidades',
  'cantidad_de_bultos',
  'precio_venta',
  'saldo_ml',
  'comision_ml',
  'costo_envio',
  'impuestos',
  'precio_amazon_usd',
  'cuit_comprador',
  'tipo_de_cambio_de_automeli',
  'tipo_de_cambio_compra',
  'cuit_envio',
  'nombre_destinatario',
  'datos_cliente',
  'ciudad',
  'provincia',
  'codigo_postal',
  'envio_domestico',
  'sku',
  'peso_volumentico',
  'valor_x_kg',
  'productoco',
  'productoco_b',
  'difactura',
  'difactura_b',
  'tefactura',
  'tefactura_b',
  'ivafactura',
  'ivafactura_b',
  'lafactura',
  'lafactura_b',
  'a13_venta',
  'tipo_de_cambio_compra_2',
  'aporte_ml',
  'flete_internacional_a',
  'iifactura',
  'cuotas_ml',
  'intervino',
  'com_vendedor',
  'delivery_status',
  'peso_confirmado',
  'largo_producto',
  'ancho_producto',
  'alto_producto',
  'estado_vbi',
  'col_28',
  'col_29',
  'col_30',
  'id_operacion',
  'traduccion_id',
  'fecha_llegada_usa',
  'fecha_salida_usa',
  'fecha_ingreso_arg',
  'fecha_salida_arg',
  'notificacion_de_amz',
  'estado_mercadolibre',
  'nro_guia_madre',
  'eta_bue',
  'alerta_eta',
  'ezeiza',
  'estado_bue',
  'stock_bue',
  'caneclada_en_usa',
  'demora_usa_ba',
  'col_33'
] as const;

export type PlanillaControlColumn = (typeof PLANILLA_CONTROL_COLUMNS)[number];

export type PlanillaControlPayload = Partial<Record<PlanillaControlColumn, unknown>>;

export const PLANILLA_CONTROL_HEADER_ALIASES: Record<string, PlanillaControlColumn> = {
  Identificador: 'identificador',
  'Nombre de Tarea': 'nombre_de_tarea',
  FECHAAMAZON: 'fecha_amazon',
  FECHACOMPRA: 'fecha_compra',
  FECHAENTREGA: 'fecha_entrega',
  FECHAVENTA: 'fecha_venta',
  NROGUIA: 'nro_guia',
  NROVENTA: 'nro_venta',
  TRANSFORMADOR: 'transformador',
  NOMBREPRODUCTO: 'nombre_producto',
  LINKML: 'link_ml',
  ESTADO: 'estado',
  ESTADOENVIO: 'estado_envio',
  ETD: 'etd',
  OBSOPERACIONES: 'obs_operaciones',
  TIPOVENTA: 'tipo_venta',
  LINKAMAZON: 'link_amazon',
  NPEDIDOAMZ: 'n_pedido_amz',
  PESOPRODUCTO: 'peso_producto',
  'Tracking amazon': 'tracking_amazon',
  'Cantidad de Unidades': 'cantidad_unidades',
  'CANTIDAD DE BULTOS': 'cantidad_de_bultos',
  PRECIOVENTA: 'precio_venta',
  SALDOML: 'saldo_ml',
  COMISIONML: 'comision_ml',
  COSTOENVIO: 'costo_envio',
  Impuestos: 'impuestos',
  PRECIOAMAZONUSD: 'precio_amazon_usd',
  CUITCOMPRADOR: 'cuit_comprador',
  'Tipo de cambio de Automeli': 'tipo_de_cambio_de_automeli',
  TIPODECAMBIOCOMPRA: 'tipo_de_cambio_compra',
  CUITENVIO: 'cuit_envio',
  NOMBREDESTINATARIO: 'nombre_destinatario',
  'Datos Cliente': 'datos_cliente',
  CIUDAD: 'ciudad',
  PROVINCIA: 'provincia',
  'CODIGO POSTAL': 'codigo_postal',
  'ENVIO DOMESTICO': 'envio_domestico',
  SKU: 'sku',
  PESOVOLUMENTICO: 'peso_volumentico',
  VALORXKG: 'valor_x_kg',
  Productoco: 'productoco',
  'Productoco.b': 'productoco_b',
  DIFACTURA: 'difactura',
  'DIFACTURA.B': 'difactura_b',
  TEFACTURA: 'tefactura',
  'TEFACTURA.B': 'tefactura_b',
  IVAFACTURA: 'ivafactura',
  'IVAFACTURA.B': 'ivafactura_b',
  LAFACTURA: 'lafactura',
  'LAFACTURA.B': 'lafactura_b',
  A13VENTA: 'a13_venta',
  'APORTE ML': 'aporte_ml',
  FLETEINTERNACIONALA: 'flete_internacional_a',
  IIFACTURA: 'iifactura',
  CUOTASML: 'cuotas_ml',
  INTERVINO: 'intervino',
  'COM Vendedor': 'com_vendedor',
  DELIVERYSTATUS: 'delivery_status',
  PESOCONFIRMADO: 'peso_confirmado',
  LARGOPRODUCTO: 'largo_producto',
  ANCHOPRODUCTO: 'ancho_producto',
  ALTOPRODUCTO: 'alto_producto',
  ESTADOVBI: 'estado_vbi',
  '28': 'col_28',
  '29': 'col_29',
  '30': 'col_30',
  'Id operacion': 'id_operacion',
  'Traduccion ID': 'traduccion_id',
  'Fecha llegada USA': 'fecha_llegada_usa',
  'Fecha Salida Usa': 'fecha_salida_usa',
  'Fecha ingreso Arg': 'fecha_ingreso_arg',
  'Fecha Salida Arg': 'fecha_salida_arg',
  'Notificacion de Amz': 'notificacion_de_amz',
  'ESTADO MERCADOLIBRE': 'estado_mercadolibre',
  NROGUIAMADRE: 'nro_guia_madre',
  ETABUE: 'eta_bue',
  'ALERTA ETA': 'alerta_eta',
  Ezeiza: 'ezeiza',
  'ESTADO BUE': 'estado_bue',
  'STOCK BUE': 'stock_bue',
  'CANECLADA EN USA': 'caneclada_en_usa',
  'Demora USA-BA': 'demora_usa_ba',
  '33': 'col_33'
};

export function normalizePlanillaControlKey(key: string): PlanillaControlColumn | null {
  if (key in PLANILLA_CONTROL_HEADER_ALIASES) {
    return PLANILLA_CONTROL_HEADER_ALIASES[key];
  }

  const normalized = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return PLANILLA_CONTROL_COLUMNS.includes(normalized as PlanillaControlColumn)
    ? (normalized as PlanillaControlColumn)
    : null;
}

export function derivePlanillaControlId(payload: Record<string, unknown>): string | null {
  const directId = payload.id;
  if (typeof directId === 'string' && directId.trim()) {
    return directId.trim();
  }

  const identificador = payload.identificador;
  if (typeof identificador === 'string' && identificador.trim()) {
    return identificador.trim();
  }

  const rawIdentificador = payload.Identificador;
  if (typeof rawIdentificador === 'string' && rawIdentificador.trim()) {
    return rawIdentificador.trim();
  }

  return null;
}
