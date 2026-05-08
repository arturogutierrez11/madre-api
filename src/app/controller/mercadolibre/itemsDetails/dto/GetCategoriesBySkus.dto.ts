import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class GetCategoriesBySkusDto {
  @ApiProperty({
    example: ['B0C33CHG99', 'B001RCD2DW'],
    type: [String],
    description: 'Lista de seller_sku a consultar'
  })
  @IsArray()
  @IsString({ each: true })
  skus!: string[];
}
