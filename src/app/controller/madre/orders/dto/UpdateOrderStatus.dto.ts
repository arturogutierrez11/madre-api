import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export const PERSISTENCE_STATUSES = ['PENDING', 'PROCESSED_FLOXU', 'COMPLETED', 'CANCELLED', 'FAILED'] as const;

export class UpdateOrderStatusDTO {
  @ApiPropertyOptional({ enum: PERSISTENCE_STATUSES, example: 'PROCESSED_FLOXU' })
  @IsOptional()
  @IsIn(PERSISTENCE_STATUSES)
  persistence_status?: string;

  @ApiPropertyOptional({ example: 'OK', nullable: true, description: 'Estado de notificación a Floxu' })
  @IsOptional()
  @IsString()
  notification_system_a_status?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Estado de notificación a Azure Tasks' })
  @IsOptional()
  @IsString()
  notification_system_b_status?: string | null;

  @ApiPropertyOptional({ example: 'TLQV-12270', nullable: true, description: 'identifier devuelto por Floxu' })
  @IsOptional()
  @IsString()
  floxu_code?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  last_error?: string | null;

  @ApiPropertyOptional({ example: 'Delivered', nullable: true, description: 'Status RAW del marketplace' })
  @IsOptional()
  @IsString()
  status?: string | null;

  @ApiPropertyOptional({ example: 'Delivered', nullable: true, description: 'Estado de entrega RAW del marketplace' })
  @IsOptional()
  @IsString()
  delivery_status?: string | null;

  @ApiPropertyOptional({
    example: '2026-11-05T03:00:00Z',
    nullable: true,
    description: 'ISO 8601; se persiste como DATETIME UTC'
  })
  @IsOptional()
  @IsDateString()
  estimated_delivery_date?: string | null;

  @ApiPropertyOptional({
    example: '17c6a1f2-5b1e-4f0e-9d3a-0b8f2c1e7a44',
    nullable: true,
    description: 'saleId devuelto por VBI'
  })
  @IsOptional()
  @IsString()
  vbi_sale_id?: string | null;

  @ApiPropertyOptional({ example: '19836023', nullable: true, description: 'nroVenta devuelto por VBI' })
  @IsOptional()
  @IsString()
  vbi_nro_venta?: string | null;
}
