import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertInvoiceClientIssueDto {
  @ApiProperty({ example: 'TLQV-14921' })
  @IsString()
  tlqvCode: string;

  @ApiProperty({ example: 'INVALID_FISCAL_DOCUMENT' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'tus_facturas' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ example: '2000014853225236' })
  @IsOptional()
  @IsString()
  saleNumber?: string;

  @ApiPropertyOptional({ example: 'ARTURO GUTIERREZ' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ example: 'mail@test.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'CUIT' })
  @IsOptional()
  @IsString()
  documentoTipo?: string;

  @ApiPropertyOptional({ example: '20-11111111-4' })
  @IsOptional()
  @IsString()
  documentoNro?: string;

  @ApiPropertyOptional({ example: '20111111114' })
  @IsOptional()
  @IsString()
  documentoNroDigits?: string;

  @ApiProperty({ example: 'No pudimos obtener datos para el CUIT ingresado.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'No se ha podido recuperar la condicion frente al IVA de este CUIT.',
      'No pudimos obtener datos para el CUIT ingresado.'
    ]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  messages?: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { error: 'S', apoc_existe: 'NO' }
  })
  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { provider: 'tus_facturas' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
