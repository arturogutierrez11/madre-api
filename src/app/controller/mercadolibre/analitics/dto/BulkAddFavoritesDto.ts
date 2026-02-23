import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class BulkAddFavoritesDto {
  @ApiProperty({
    example: [1, 2],
    description: 'IDs de marketplaces donde agregar favoritos'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  marketplaceIds: number[];

  @ApiProperty({
    example: [
      { productId: 'MLA123', sellerSku: 'SKU123' },
      { productId: 'MLA456', sellerSku: 'SKU456' }
    ],
    description: 'Productos a agregar como favoritos'
  })
  @IsArray()
  products: {
    productId: string;
    sellerSku: string;
  }[];
}
