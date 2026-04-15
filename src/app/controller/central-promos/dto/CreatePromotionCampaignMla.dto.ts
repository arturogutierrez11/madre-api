import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePromotionCampaignMlaDto {
  @ApiProperty({
    example: 'MLA123456789',
    description: 'MLA que participa en la campaña'
  })
  @IsString()
  mla!: string;
}
