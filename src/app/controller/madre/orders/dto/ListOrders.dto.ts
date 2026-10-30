import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PERSISTENCE_STATUSES } from './UpdateOrderStatus.dto';

export class ListOrdersDTO {
  @ApiPropertyOptional({ example: 'fravega' })
  @IsOptional()
  @IsString()
  marketplace?: string;

  @ApiPropertyOptional({ enum: PERSISTENCE_STATUSES, example: 'FAILED' })
  @IsOptional()
  @IsIn(PERSISTENCE_STATUSES)
  persistence_status?: string;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00Z', description: 'Fecha de compra desde (ISO 8601, UTC)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-31T23:59:59Z', description: 'Fecha de compra hasta (ISO 8601, UTC)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    example: 'v93713051frvg-01',
    description: 'Busca en unique_key, ids del marketplace, nombre, documento, email y TLQV'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 50, description: 'Máximo 200' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
