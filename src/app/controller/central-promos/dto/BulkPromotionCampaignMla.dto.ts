import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class BulkPromotionCampaignMlaDto {
  @ApiProperty({
    example: ['MLA123456789', 'MLA987654321'],
    description: 'Lista de MLAs',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  mlas!: string[];
}
