import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class UpsertSkuPauseFlagDto {
  @ApiProperty({ example: 'B0C33CHG99' })
  @IsString()
  sku: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  paused: boolean;
}
