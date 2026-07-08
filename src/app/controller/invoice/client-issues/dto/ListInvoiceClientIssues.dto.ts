import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListInvoiceClientIssuesDto {
  @ApiPropertyOptional({ example: 'TLQV-14921' })
  @IsOptional()
  @IsString()
  tlqvCode?: string;

  @ApiPropertyOptional({ example: 'INVALID_FISCAL_DOCUMENT' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'tus_facturas' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'open' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '20111111114' })
  @IsOptional()
  @IsString()
  documentoNroDigits?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  offset?: number;
}
