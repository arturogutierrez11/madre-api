import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesMegatoneService } from 'src/app/services/madre/categories/match/megatoneCategoriesProcess/TreeCategoriesMegatoneService';

@ApiTags('Categories Megatone')
@Controller('categories/megatone')
export class CategoriesMegatoneController {
  constructor(private readonly service: CategoriesMegatoneService) {}

  @Get(':meliCategoryId')
  @ApiOperation({ summary: 'Obtener match por meliCategoryId' })
  @ApiParam({
    name: 'meliCategoryId',
    type: String,
    example: 'MLA1234'
  })
  @ApiResponse({
    status: 200,
    description: 'Match encontrado o null'
  })
  async findByMeliCategoryId(@Param('meliCategoryId') meliCategoryId: string) {
    return this.service.findByMeliCategoryId(meliCategoryId);
  }

  @Get('exists/:meliCategoryId')
  @ApiOperation({ summary: 'Verificar si existe match' })
  @ApiParam({
    name: 'meliCategoryId',
    type: String,
    example: 'MLA1234'
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna true si existe, false si no'
  })
  async exists(@Param('meliCategoryId') meliCategoryId: string) {
    return this.service.existsMeliCategoryMatch(meliCategoryId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear o actualizar un match' })
  @ApiBody({
    schema: {
      example: {
        meliCategoryId: 'MLA1234',
        meliCategoryPath: 'Electronics > Audio',
        megatoneCategoryId: 'MT5678',
        megatoneCategoryPath: 'Audio > Parlantes'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Match creado o actualizado correctamente'
  })
  async upsert(
    @Body()
    body: {
      meliCategoryId: string;
      meliCategoryPath: string;
      megatoneCategoryId: string;
      megatoneCategoryPath: string;
    }
  ) {
    await this.service.upsertMeliCategoryMatch(body);
    return { success: true };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Crear o actualizar múltiples matches' })
  @ApiBody({
    schema: {
      example: {
        items: [
          {
            meliCategoryId: 'MLA1234',
            meliCategoryPath: 'Electronics > Audio',
            megatoneCategoryId: 'MT5678',
            megatoneCategoryPath: 'Audio > Parlantes'
          },
          {
            meliCategoryId: 'MLA9999',
            meliCategoryPath: 'Home > Kitchen',
            megatoneCategoryId: 'MT1111',
            megatoneCategoryPath: 'Cocina > Electrodomésticos'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Matches insertados correctamente'
  })
  async upsertMany(
    @Body()
    body: {
      items: {
        meliCategoryId: string;
        meliCategoryPath: string;
        megatoneCategoryId: string;
        megatoneCategoryPath: string;
      }[];
    }
  ) {
    await this.service.upsertManyMeliCategoryMatch(body.items);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Listar matches con paginación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 100
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de matches'
  })
  async findAll(@Query('limit') limit = 100, @Query('offset') offset = 0) {
    return this.service.findAllMeliCategoryMatches(Number(limit), Number(offset));
  }
}
