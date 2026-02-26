import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FavoriteProductDto {
  @ApiProperty({ example: 'MLA123' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'SKU123' })
  @IsString()
  sellerSku: string;
}

export class BulkAddFavoritesDto {
  @ApiProperty({
    example: [1, 2],
    description: 'IDs de marketplaces donde agregar favoritos'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  marketplaceIds: number[];

  @ApiProperty({
    type: [FavoriteProductDto],
    description: 'Productos a agregar como favoritos'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteProductDto)
  products: FavoriteProductDto[];
}
