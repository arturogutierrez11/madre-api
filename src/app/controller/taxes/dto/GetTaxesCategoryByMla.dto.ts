import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetTaxesCategoryByMlaDto {
  @ApiProperty({
    example: 'MLA1055',
    description: 'MLA de categoría a consultar'
  })
  @IsString()
  mla!: string;
}
