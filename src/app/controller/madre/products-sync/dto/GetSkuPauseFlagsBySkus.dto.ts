import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class GetSkuPauseFlagsBySkusDto {
  @ApiProperty({
    type: [String],
    example: ['B0C33CHG99', 'B001RCD2DW']
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  skus: string[];
}
