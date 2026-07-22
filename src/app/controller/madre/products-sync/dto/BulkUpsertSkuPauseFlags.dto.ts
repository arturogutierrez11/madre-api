import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { UpsertSkuPauseFlagDto } from './UpsertSkuPauseFlag.dto';

export class BulkUpsertSkuPauseFlagsDto {
  @ApiProperty({
    type: [UpsertSkuPauseFlagDto],
    example: {
      items: [
        { sku: 'B0C33CHG99', paused: true },
        { sku: 'B001RCD2DW', paused: false }
      ]
    }
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => UpsertSkuPauseFlagDto)
  items: UpsertSkuPauseFlagDto[];
}
