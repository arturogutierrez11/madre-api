import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class GetAutomeliProductSnapshotsBySkusDto {
  @ApiProperty({
    example: ['B0C33CHG99', 'B001RCD2DW'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  skus!: string[];
}
