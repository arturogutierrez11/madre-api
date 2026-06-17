import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ListAutomeliProductSnapshotsDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 50 })
  limit?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  offset?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'MLA1488473899' })
  mla?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'B0BLHBC7JM' })
  sku?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 59.01 })
  totalPrice?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 50 })
  totalPriceMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 100 })
  totalPriceMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 59.01 })
  scrapedPrice?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 50 })
  scrapedPriceMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 100 })
  scrapedPriceMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  stockQuantity?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  stockQuantityMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 5 })
  stockQuantityMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Agotado' })
  amzStatus?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '--' })
  changed?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  maxWeight?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  maxWeightMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 10 })
  maxWeightMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 662999 })
  meliSalePrice?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 500000 })
  meliSalePriceMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 1000000 })
  meliSalePriceMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'paused' })
  meliStatus?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'gold_special' })
  listingTypeId?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'out_of_stock' })
  subStatus?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  appStatus?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-05-01 00:00:00' })
  createdAtFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-05-31 23:59:59' })
  createdAtTo?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-05-01 00:00:00' })
  updatedAtFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-05-31 23:59:59' })
  updatedAtTo?: string;
}
