import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreatePublicationRunDto {
  @ApiProperty({
    example: ['meli', 'fravega']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  marketplaces: string[];
}
