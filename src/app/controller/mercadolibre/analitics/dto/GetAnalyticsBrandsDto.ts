import { IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAnalyticsBrandsDto {
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

  @ApiPropertyOptional({
    enum: ['orders', 'visits', 'products'],
    example: 'orders'
  })
  @IsOptional()
  @IsIn(['orders', 'visits', 'products'])
  orderBy?: 'orders' | 'visits' | 'products';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}
