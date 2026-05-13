import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetAutomeliProductSnapshotsBySkusDto {
  @ApiProperty({
    example: ['B0C33CHG99', 'B001RCD2DW'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  skus!: string[];

  @ApiPropertyOptional({
    example: ['sku', 'totalPrice', 'maxWeight'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({
    example: true
  })
  @IsOptional()
  @IsBoolean()
  uniqueBySku?: boolean;
}
