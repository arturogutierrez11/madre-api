import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { GetAnalyticsProductsDto } from './GetAnalyticsProductsDto';

export class SaveSelectionDto {
  @ApiProperty()
  @IsNumber()
  marketplaceId: number;

  @ApiProperty({ type: GetAnalyticsProductsDto })
  @ValidateNested()
  @Type(() => GetAnalyticsProductsDto)
  filters: GetAnalyticsProductsDto;
}
