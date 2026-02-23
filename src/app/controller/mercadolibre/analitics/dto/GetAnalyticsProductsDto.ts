import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsIn, IsArray } from 'class-validator';

export class GetAnalyticsProductsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'Samsung' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minVisits?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxVisits?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minOrders?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxOrders?: number;

  @ApiPropertyOptional({
    example: 'visits',
    enum: ['visits', 'orders', 'price']
  })
  @IsOptional()
  @IsIn(['visits', 'orders', 'price'])
  orderBy?: 'visits' | 'orders' | 'price';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc';

  /* ================= EXCLUDE MARKETPLACE ================= */

  @ApiPropertyOptional({
    description: 'Excluir productos publicados en uno o más marketplaces (separados por coma)',
    example: 'megatone,oncity'
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((v: string) => v.trim()) : value))
  @IsArray()
  @IsString({ each: true })
  excludeMarketplace?: string[];
}
