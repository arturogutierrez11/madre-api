import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsArray, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetAnalyticsProductsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minVisits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxVisits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minOrders?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxOrders?: number;

  @ApiPropertyOptional({
    description: 'Excluir productos publicados en estos marketplaces',
    example: 'megatone,oncity'
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((v: string) => v.trim()) : value))
  @IsArray()
  excludeMarketplace?: string[];

  @ApiPropertyOptional({
    description: 'Filtrar productos que estén en una carpeta específica'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  inMarketplace?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de publicación',
    enum: ['published', 'not_published']
  })
  @IsOptional()
  @IsIn(['published', 'not_published'])
  marketplaceStatus?: 'published' | 'not_published';
}
