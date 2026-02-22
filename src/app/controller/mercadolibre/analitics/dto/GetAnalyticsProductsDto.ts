import { IsOptional, IsInt, IsIn, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAnalyticsProductsDto {
  /* ================= PAGINATION ================= */

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /* ================= BRAND ================= */

  @ApiPropertyOptional({
    example: 'Samsung',
    description: 'Filtrar por marca exacta'
  })
  @IsOptional()
  @IsString()
  brand?: string;

  /* ================= PRICE ================= */

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  /* ================= VISITS ================= */

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minVisits?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxVisits?: number;

  /* ================= ORDERS ================= */

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minOrders?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxOrders?: number;

  /* ================= SORTING ================= */

  @ApiPropertyOptional({
    enum: ['visits', 'orders', 'price'],
    example: 'visits'
  })
  @IsOptional()
  @IsIn(['visits', 'orders', 'price'])
  orderBy?: 'visits' | 'orders' | 'price';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}
