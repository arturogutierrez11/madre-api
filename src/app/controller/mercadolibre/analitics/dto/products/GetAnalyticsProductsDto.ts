import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsArray, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

function normalizeMarketplaceQuery(value: unknown): string[] | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : [value];

  const normalized = rawValues
    .flatMap(item => String(item).split(','))
    .map(item => item.trim())
    .filter(Boolean);

  return normalized.length ? Array.from(new Set(normalized)) : undefined;
}

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
    example: ['megatone', 'fravega']
  })
  @IsOptional()
  @Transform(({ value }) => normalizeMarketplaceQuery(value))
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

  @ApiPropertyOptional({
    description: 'Filtrar por estado del producto',
    enum: ['active', 'under_review', 'paused', 'closed']
  })
  @IsOptional()
  @IsIn(['active', 'under_review', 'paused', 'closed'])
  status?: 'active' | 'under_review' | 'paused' | 'closed';

  @ApiPropertyOptional({
    description: 'Filtrar productos disponibles para un marketplace específico',
    enum: ['megatone', 'fravega']
  })
  @IsOptional()
  @IsIn(['megatone', 'fravega'])
  matchedMarketplace?: 'megatone' | 'fravega';
}
