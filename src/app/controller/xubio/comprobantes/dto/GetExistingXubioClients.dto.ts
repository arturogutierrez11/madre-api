import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class GetExistingXubioClientsDto {
  @ApiProperty({ example: ['30652957044', '20317755512'], type: [String] })
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  clientCodes!: string[];
}
