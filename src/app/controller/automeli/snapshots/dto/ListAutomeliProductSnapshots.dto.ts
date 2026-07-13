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
  @ApiPropertyOptional({ example: 'COSORI' })
  brand?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Freidora De Aire Compacta Cosori Turboblaze 6.0l Asa, Horn Gris Oscuro' })
  title?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '11 dias' })
  manufacturingTime?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Cambió de ASIN' })
  pauseReason?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-01 00:00:00' })
  pausedSinceFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-30 23:59:59' })
  pausedSinceTo?: string;

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
  shippingCost?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  shippingCostMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 100 })
  shippingCostMax?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  taxes?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  taxesMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 1000 })
  taxesMax?: number;

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
  @ApiPropertyOptional({ example: 4 })
  discountTotalPrice?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: -10 })
  discountTotalPriceMin?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 10 })
  discountTotalPriceMax?: number;

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
  @ApiPropertyOptional({ example: 'MLA1424202023' })
  idMeliMainVariant?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'https://m.media-amazon.com/images/I/71j8G9EH-DL.jpg' })
  image?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  imageChanged?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'https://m.media-amazon.com/images/I/81R9sA3IyBL.jpg' })
  imageChangedUrl?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'http://articulo.mercadolibre.com.ar/MLA-1424202023-freidora-de-aire-compacta-cosori-turboblaze-60l-asa-horn-_JM' })
  permalink?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'De Aire' })
  meliCategoryName?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Electrodomesticos y Aires Ac.' })
  meliMainCategory?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'amazon' })
  shippingFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 26 })
  taxCategoryId?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  createUsingPublisher?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-01 00:00:00' })
  dateUpdatedFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-30 23:59:59' })
  dateUpdatedTo?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-01 00:00:00' })
  dateUpdatedMeliFrom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '2026-06-30 23:59:59' })
  dateUpdatedMeliTo?: string;

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
