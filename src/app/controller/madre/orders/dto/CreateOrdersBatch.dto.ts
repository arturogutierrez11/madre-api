import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class NormalizedOrderDTO {
  @ApiProperty({ example: 'fravega', enum: ['fravega', 'megatone', 'oncity', 'mercadolibre'] })
  @IsString()
  @IsIn(['fravega', 'megatone', 'oncity', 'mercadolibre'])
  marketplace: string;

  @ApiProperty({ example: '18521376', description: 'ID de orden en el marketplace' })
  @IsString()
  external_order_id: string;

  @ApiPropertyOptional({
    example: 'v90520163frvg-01',
    nullable: true,
    description: 'Suborden (Fravega). null en Megatone/OnCity'
  })
  @IsOptional()
  @IsString()
  external_suborder_id?: string | null;

  @ApiProperty({
    example: 'fravega:v90520163frvg-01',
    description: 'Clave de deduplicación: {marketplace}:{externalId}'
  })
  @IsString()
  unique_key: string;

  @ApiPropertyOptional({
    example: '2026-05-12T15:20:43Z',
    nullable: true,
    description: 'ISO 8601; se persiste como DATETIME UTC'
  })
  @IsOptional()
  @IsString()
  purchase_date?: string | null;

  @ApiPropertyOptional({ example: 'Gabriela Hidalgo', nullable: true })
  @IsOptional()
  @IsString()
  customer_name?: string | null;

  @ApiPropertyOptional({ example: '27253275877', nullable: true })
  @IsOptional()
  @IsString()
  customer_document?: string | null;

  @ApiPropertyOptional({ example: '(261) 656-2613', nullable: true })
  @IsOptional()
  @IsString()
  customer_phone?: string | null;

  @ApiPropertyOptional({
    example: 'hidalgogabriela92@gmail.com',
    nullable: true,
    description: 'Requerido por Floxu/Azure'
  })
  @IsOptional()
  @IsString()
  customer_email?: string | null;

  @ApiPropertyOptional({ example: 690399, nullable: true })
  @IsOptional()
  @IsNumber()
  amount_total?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'null = ARS implícito' })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @ApiPropertyOptional({
    example: 'Created',
    nullable: true,
    description: 'Status RAW del marketplace, sin normalizar'
  })
  @IsOptional()
  @IsString()
  status?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  delivery_status?: string | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  items_quantity?: number | null;

  @ApiPropertyOptional({
    example: 'Pedraza 990 Barrio casas del sol MB casa 14',
    nullable: true,
    description: '"Datos Cliente": street + number + floor'
  })
  @IsOptional()
  @IsString()
  shipping_address?: string | null;

  @ApiPropertyOptional({ example: 'El Plumerillo', nullable: true })
  @IsOptional()
  @IsString()
  shipping_city?: string | null;

  @ApiPropertyOptional({ example: 'Mendoza', nullable: true })
  @IsOptional()
  @IsString()
  shipping_province?: string | null;

  @ApiPropertyOptional({ example: '5539', nullable: true })
  @IsOptional()
  @IsString()
  shipping_zip_code?: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Payload crudo del marketplace tal cual llega'
  })
  @IsObject()
  source_payload: Record<string, any>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'Canónico completo + overflow dinámico'
  })
  @IsOptional()
  @IsObject()
  normalized_payload?: Record<string, any> | null;

  @ApiPropertyOptional({ example: 'v1', nullable: true })
  @IsOptional()
  @IsString()
  source_schema_version?: string | null;
}

export class CreateOrdersBatchDTO {
  @ApiProperty({ type: [NormalizedOrderDTO], description: 'Lote de órdenes normalizadas enviadas por orders-api' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NormalizedOrderDTO)
  orders: NormalizedOrderDTO[];
}
