import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class XubioProductItemDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() transaccionCvItemId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() productoId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() productoCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() productoNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() depositoId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() depositoCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() depositoNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cantidad?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() precio?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importe?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() iva?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() total?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() precioConIvaIncluido?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() montoExento?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() porcentajeDescuento?: number;
  @ApiProperty({ example: {} }) @IsObject() rawPayload!: Record<string, unknown>;
}

class XubioCobranzaItemDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() itemId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cuentaTipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() cuentaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() monedaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() monedaCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() monedaNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cotizacionMonedaTransaccion?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeMonedaPrincipal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeMonedaTransaccion?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ example: {} }) @IsObject() rawPayload!: Record<string, unknown>;
}

class XubioPercepcionItemDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() itemId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importe?: number;
  @ApiProperty({ example: {} }) @IsObject() rawPayload!: Record<string, unknown>;
}

class XubioComprobanteDto {
  @ApiProperty({ example: 123456 }) @IsInt() xubioTransactionId!: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() syncRunId?: number;
  @ApiPropertyOptional({ example: 'api' }) @IsOptional() @IsIn(['api', 'excel', 'manual']) source?: 'api' | 'excel' | 'manual';
  @ApiPropertyOptional() @IsOptional() @IsString() externalId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroDocumento?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() tipoCodigo?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tipoNombre?: string;
  @ApiPropertyOptional({ example: 'INVOICE' }) @IsOptional() @IsIn(['INVOICE', 'CREDIT_NOTE', 'FCE', 'UNKNOWN']) documentKind?: 'INVOICE' | 'CREDIT_NOTE' | 'FCE' | 'UNKNOWN';
  @ApiPropertyOptional() @IsOptional() @IsString() letraComprobante?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tlqvCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() tlqvNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() mlOrderId?: string;
  @ApiProperty({ example: '2026-07-01' }) @IsString() fechaEmision!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fechaVencimiento?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeGravado?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeImpuestos?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() importeMonedaPrincipal?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() monedaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() monedaCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() monedaNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cotizacion?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cotizacionListaPrecio?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() circuitoContableId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() circuitoContableCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() circuitoContableNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() depositoId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() depositoCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() depositoNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() condicionPago?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() porcentajeComision?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() puntoVentaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() puntoVentaCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() puntoVentaNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() clienteXubioId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() provinciaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() provinciaCodigo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() provinciaNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() facturaNoExportacion?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() cbuInformada?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() mailEstado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cae?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() caeFechaVencimiento?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() fiscalmenteEmitido?: boolean;
  @ApiPropertyOptional({ example: {} }) @IsOptional() @IsObject() rawListPayload?: Record<string, unknown>;
  @ApiProperty({ example: {} }) @IsObject() rawDetailPayload!: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() syncedAt?: string;

  @ApiPropertyOptional({ type: [XubioProductItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XubioProductItemDto)
  productItems?: XubioProductItemDto[];

  @ApiPropertyOptional({ type: [XubioCobranzaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XubioCobranzaItemDto)
  cobranzaItems?: XubioCobranzaItemDto[];

  @ApiPropertyOptional({ type: [XubioPercepcionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XubioPercepcionItemDto)
  percepcionItems?: XubioPercepcionItemDto[];
}

export class UpsertXubioComprobantesBatchDto {
  @ApiProperty({ type: [XubioComprobanteDto] })
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => XubioComprobanteDto)
  items!: XubioComprobanteDto[];
}
