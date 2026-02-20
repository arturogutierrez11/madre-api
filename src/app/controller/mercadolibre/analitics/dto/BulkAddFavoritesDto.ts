import { IsOptional, IsNumber, IsString } from 'class-validator';

export class BulkAddFavoritesDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsNumber()
  minRevenue?: number;

  @IsOptional()
  @IsNumber()
  minVisits?: number;

  @IsOptional()
  @IsNumber()
  minOrders?: number;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
