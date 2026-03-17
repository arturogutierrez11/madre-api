import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TreeCategoriesFravegaService } from 'src/app/services/madre/categories/match/fravegaCategoriesProcess/TreeCategoriesFravegaService';

@ApiTags('Categories Fravega')
@Controller('categories/fravega')
export class CategoriesFravegaController {
  constructor(private readonly service: TreeCategoriesFravegaService) {}

  // =========================
  // TREE
  // =========================

  @Get('tree')
  @ApiOperation({ summary: 'Obtener árbol de categorías de Frávega' })
  async getTree() {
    return this.service.getFravegaCategoriesTree();
  }

  @Get('attributes/:categoryId')
  @ApiOperation({ summary: 'Obtener atributos de una categoría de Frávega' })
  async getAttributes(@Param('categoryId') categoryId: string) {
    return this.service.getCategoryAttributes(categoryId);
  }

  // =========================
  // ML → FRAVEGA MATCH
  // =========================

  @Get('match/:meliCategoryId')
  @ApiOperation({ summary: 'Obtener match por meliCategoryId' })
  async findByMeliCategoryId(@Param('meliCategoryId') meliCategoryId: string) {
    return this.service.findByMeliCategoryId(meliCategoryId);
  }

  @Get('match/exists/:meliCategoryId')
  @ApiOperation({ summary: 'Verificar si existe match' })
  async exists(@Param('meliCategoryId') meliCategoryId: string) {
    return this.service.existsMeliCategoryMatch(meliCategoryId);
  }

  @Post('match')
  @ApiOperation({ summary: 'Guardar match ML → Frávega' })
  async save(
    @Body()
    body: {
      meliCategoryId: string;
      meliCategoryPath: string;
      fravegaCategoryId: string;
      fravegaCategoryPath: string;
    }
  ) {
    return this.service.saveMeliCategoryMatch(body);
  }

  @Post('match/bulk')
  @ApiOperation({ summary: 'Guardar múltiples matches' })
  async saveMany(
    @Body()
    body: {
      items: {
        meliCategoryId: string;
        meliCategoryPath: string;
        fravegaCategoryId: string;
        fravegaCategoryPath: string;
      }[];
    }
  ) {
    return this.service.saveManyMeliCategoryMatch(body.items);
  }

  @Get('match')
  @ApiOperation({ summary: 'Listar matches con paginación' })
  async getAll(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.service.getAllMeliCategoryMatches(Number(page), Number(limit));
  }
}
