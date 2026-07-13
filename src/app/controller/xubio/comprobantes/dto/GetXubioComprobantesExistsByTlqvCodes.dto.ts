import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class GetXubioComprobantesExistsByTlqvCodesDto {
  @ApiProperty({
    type: [String],
    example: ['TLQV-7734', 'TLQV-14921', 'TLQV-14027']
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  tlqvCodes: string[];
}
