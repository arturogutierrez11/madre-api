import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListAutomeliProductSnapshotsDto {
  @ApiPropertyOptional({ example: 50 })
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  offset?: number;

  @ApiPropertyOptional({ example: 'MLA1488473899' })
  mla?: string;

  @ApiPropertyOptional({ example: 'B0BLHBC7JM' })
  sku?: string;

  @ApiPropertyOptional({ example: 59.01 })
  totalPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  totalPriceMin?: number;

  @ApiPropertyOptional({ example: 100 })
  totalPriceMax?: number;

  @ApiPropertyOptional({ example: 59.01 })
  scrapedPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  scrapedPriceMin?: number;

  @ApiPropertyOptional({ example: 100 })
  scrapedPriceMax?: number;

  @ApiPropertyOptional({ example: 0 })
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 0 })
  stockQuantityMin?: number;

  @ApiPropertyOptional({ example: 5 })
  stockQuantityMax?: number;

  @ApiPropertyOptional({ example: 'Agotado' })
  amzStatus?: string;

  @ApiPropertyOptional({ example: '--' })
  changed?: string;

  @ApiPropertyOptional({ example: 1 })
  maxWeight?: number;

  @ApiPropertyOptional({ example: 1 })
  maxWeightMin?: number;

  @ApiPropertyOptional({ example: 10 })
  maxWeightMax?: number;

  @ApiPropertyOptional({ example: 662999 })
  meliSalePrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  meliSalePriceMin?: number;

  @ApiPropertyOptional({ example: 1000000 })
  meliSalePriceMax?: number;

  @ApiPropertyOptional({ example: 'paused' })
  meliStatus?: string;

  @ApiPropertyOptional({ example: 'gold_special' })
  listingTypeId?: string;

  @ApiPropertyOptional({ example: 'out_of_stock' })
  subStatus?: string;

  @ApiPropertyOptional({ example: 1 })
  appStatus?: number;

  @ApiPropertyOptional({ example: '2026-05-01 00:00:00' })
  createdAtFrom?: string;

  @ApiPropertyOptional({ example: '2026-05-31 23:59:59' })
  createdAtTo?: string;

  @ApiPropertyOptional({ example: '2026-05-01 00:00:00' })
  updatedAtFrom?: string;

  @ApiPropertyOptional({ example: '2026-05-31 23:59:59' })
  updatedAtTo?: string;
}
