import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class GetXubioComprobantesByTlqvCodesDto {
  @ApiProperty({ example: ['TLQV-101', 'TLQV-102'], type: [String] })
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  tlqvCodes!: string[];
}
