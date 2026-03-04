import { Body, Controller, Get, Param, ParseEnumPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoryMatchService } from 'src/app/services/madre/categories/match/CategoryMatchService';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';
import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';

@ApiTags('categories')
@Controller('categories')
export class CategoryMatchController {
  constructor(private readonly categoryMatchService: CategoryMatchService) {}

  @Get(':market/match')
  @ApiParam({
    name: 'market',
    enum: MarketName,
    example: MarketName.MEGATONE
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getCategoriesMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Query('page') page = 1,
    @Query('limit') limit = 50
  ) {
    return this.categoryMatchService.getCategoriesMatchPaginated(market, Number(page), Number(limit));
  }

  @Get(':market/categories/match/exists/:sku')
  @ApiOperation({
    summary: 'Verifica si un SKU tiene categoría matcheada'
  })
  @ApiParam({
    name: 'market',
    enum: MarketName
  })
  @ApiParam({
    name: 'sku',
    example: 'B002UTY3ES'
  })
  async skuHasCategoryMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Param('sku') sku: string
  ) {
    const exists = await this.categoryMatchService.skuHasCategoryMatch(market, sku);

    return {
      sku,
      hasCategoryMatch: exists
    };
  }

  @Post(':market/categories/match')
  @ApiOperation({
    summary: 'Crear o actualizar match de categorías (single o bulk)'
  })
  @ApiParam({
    name: 'market',
    enum: MarketName
  })
  @ApiBody({
    description: 'Puede enviar un objeto o un array',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            sku: { type: 'string', example: 'B07XLV1XKC' },
            categoryId: { type: 'string', example: 'MLA5725' },
            categoryName: { type: 'string', example: 'Accesorios para Vehículos' },
            categoryPath: { type: 'string', example: 'MLA1000>MLA5725' }
          },
          required: ['sku', 'categoryId', 'categoryName', 'categoryPath']
        },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sku: { type: 'string', example: 'B07XLV1XKC' },
              categoryId: { type: 'string', example: 'MLA5725' },
              categoryName: { type: 'string', example: 'Accesorios para Vehículos' },
              categoryPath: { type: 'string', example: 'MLA1000>MLA5725' }
            },
            required: ['sku', 'categoryId', 'categoryName', 'categoryPath']
          }
        }
      ]
    }
  })
  async createCategoryMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Body() body: CategoriesMatchToMarket | CategoriesMatchToMarket[]
  ) {
    return this.categoryMatchService.saveCategoryMatch(market, body);
  }
}
