import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export const PERSISTENCE_STATUSES = ['PENDING', 'PROCESSED_FLOXU', 'COMPLETED', 'FAILED'] as const;

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

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Número de factura' })
  @IsOptional()
  @IsString()
  invoice_number?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'URL de la factura' })
  @IsOptional()
  @IsString()
  invoice_url?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Fecha de factura ISO 8601 (DATETIME UTC)' })
  @IsOptional()
  @IsString()
  invoice_date?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  last_error?: string | null;
}
