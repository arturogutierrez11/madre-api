import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BrandMadreService } from 'src/app/services/madre/brands/BrandMadreService';

@ApiTags('brands')
@Controller('brands')
export class BrandsMadreController {
  constructor(private readonly brandsMadreService: BrandMadreService) {}

  @Get('madre')
  @ApiOperation({
    summary: 'Listar marcas de la base madre',
    description: 'Retorna un listado paginado de todas las marcas existentes en la base de datos madre'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de marcas por página',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de marcas de la base madre',
    schema: {
      example: {
        page: 1,
        limit: 20,
        total: 345,
        totalPage: 18,
        data: [
          {
            brand: 'Manhattan Portage'
          },
          {
            brand: 'Sony'
          }
        ]
      }
    }
  })
  @Get('madre')
  async listAllBrands(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.brandsMadreService.listAllBrandsofMadre(Number(page), Number(limit));
  }
}
