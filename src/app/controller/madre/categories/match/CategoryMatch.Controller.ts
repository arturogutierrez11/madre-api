import { Body, Controller, Get, Param, ParseEnumPipe, Post, Query } from '@nestjs/common';

import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CategoryMatchService } from 'src/app/services/madre/categories/match/CategoryMatchService';
import { TreeCategoriesServices } from 'src/app/services/madre/categories/match/fravegaCategoriesProcess/TreeCategoriesService';

import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';
import { CategoriesMatchToMarket } from 'src/core/entities/madre/categories/match/CategoriesMatchToMarket';

@ApiTags('categories')
@Controller('categories')
export class CategoryMatchController {
  constructor(
    private readonly categoryMatchService: CategoryMatchService,
    private readonly treeCategoriesServices: TreeCategoriesServices
  ) {}

  // =========================
  // SKU CATEGORY MATCH
  // =========================

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
  async createCategoryMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Body() body: CategoriesMatchToMarket | CategoriesMatchToMarket[]
  ) {
    return this.categoryMatchService.saveCategoryMatch(market, body);
  }

  // =========================
  // FRAVEGA TREE
  // =========================

  @Get('fravegaTree')
  @ApiOperation({
    summary: 'Devuelve árbol de categorías de Fravega'
  })
  async getAllFravegaTree() {
    return this.treeCategoriesServices.getFravegaCategoriesTree();
  }

  @Get('fravega/:id/attributes')
  @ApiOperation({
    summary: 'Obtiene atributos de una categoría de Fravega'
  })
  async getFravegaCategoryAttributes(@Param('id') categoryId: string) {
    return this.treeCategoriesServices.getCategoryAttributes(categoryId);
  }

  // =========================
  // MELI → FRAVEGA CATEGORY MATCH
  // =========================

  @Get('meli/match')
  @ApiOperation({
    summary: 'Obtiene todos los matches ML → Fravega'
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllMeliMatches(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.treeCategoriesServices.getAllMeliCategoryMatches(Number(page), Number(limit));
  }

  @Get('meli/match/:meliCategoryId')
  @ApiOperation({
    summary: 'Obtiene match ML → Fravega por categoría ML'
  })
  async getMeliCategoryMatch(@Param('meliCategoryId') meliCategoryId: string) {
    return this.treeCategoriesServices.findByMeliCategoryId(meliCategoryId);
  }

  @Get('meli/match/exists/:meliCategoryId')
  @ApiOperation({
    summary: 'Verifica si una categoría ML ya tiene match'
  })
  async existsMeliCategoryMatch(@Param('meliCategoryId') meliCategoryId: string) {
    return this.treeCategoriesServices.existsMeliCategoryMatch(meliCategoryId);
  }

  @Post('meli/match')
  @ApiOperation({
    summary: 'Crear o actualizar match ML → Fravega'
  })
  async createMeliCategoryMatch(
    @Body()
    body: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }
  ) {
    return this.treeCategoriesServices.saveMeliCategoryMatch(body);
  }

  @Post('meli/match/bulk')
  @ApiOperation({
    summary: 'Crear o actualizar múltiples matches ML → Fravega'
  })
  async createBulkMeliCategoryMatch(
    @Body()
    body: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }[]
  ) {
    return this.treeCategoriesServices.saveManyMeliCategoryMatch(body);
  }
}
