import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListInvoiceClientIssueClientsDto {
  @ApiPropertyOptional({ example: 'TLQV-14921' })
  @IsOptional()
  @IsString()
  tlqvCode?: string;

  @ApiPropertyOptional({ example: 'ARTURO GUTIERREZ' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ example: 'mail@test.com' })
  @IsOptional()
  @IsString()
  email?: string;

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
