import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryMadreService } from 'src/app/services/madre/categories/CategoryMadreService';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { CategoryMadre } from 'src/core/entities/madre/categories/CategoryMadre';

@ApiTags('categories')
@Controller('categories')
export class CategoryMadreController {
  constructor(private readonly categoryMadreService: CategoryMadreService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar categorías únicas desde productos_madre',
    description:
      'Devuelve un listado paginado de categorías distintas de la base Madre. ' +
      'Cada categoría incluye un id y un sku representativos.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Número de página (base 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 50,
    description: 'Cantidad de registros por página'
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de categorías',
    schema: {
      example: {
        total: 128,
        limit: 50,
        offset: 0,
        count: 50,
        hasNext: true,
        nextOffset: 50,
        items: [
          {
            id: 1,
            sku: 'B00CJQKSG4',
            category: 'Ropa y Accesorios > Equipaje, Bolsos y Carteras > Mochilas'
          }
        ]
      }
    }
  })
  @Get('categories')
  async getCategories(@Query('page') page = 1, @Query('limit') limit = 50): Promise<PaginatedResult<CategoryMadre>> {
    return this.categoryMadreService.getCategoriesFromMadreDB(Number(page), Number(limit));
  }
}
