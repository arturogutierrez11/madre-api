import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandMatchDto {
  @ApiProperty()
  meliBrand: string;

  @ApiProperty()
  fravegaBrandId: string;

  @ApiProperty()
  fravegaBrandName: string;

  @ApiProperty()
  confidence: number;
}
