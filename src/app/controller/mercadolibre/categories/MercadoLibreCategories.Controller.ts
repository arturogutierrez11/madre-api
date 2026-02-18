import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { MercadoLibreCategoriesService } from 'src/app/services/mercadolibre/categories/MercadoLibreCategoriesService';
import { FlatCategory, MercadoLibreCategory } from 'src/core/entities/mercadolibre/categories/MercadoLibreCategory';

@ApiTags('MercadoLibre - Categories')
@Controller('mercadolibre/categories')
export class MercadoLibreCategoriesController {
  constructor(private readonly categoriesService: MercadoLibreCategoriesService) {}

  // ─────────────────────────────────────────────
  // POST - SAVE BULK
  // ─────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Guarda categorías de MercadoLibre (bulk)',
    description: `
Guarda o actualiza múltiples categorías en formato plano (flat).
Se usa para persistir el árbol completo de Meli.
    `
  })
  @ApiBody({
    schema: {
      example: [
        {
          id: 'MLA9304',
          name: 'Souvenirs, Cotillón y Fiestas',
          parentId: null,
          level: 1,
          path: 'MLA9304'
        }
      ]
    }
  })
  @ApiOkResponse({
    schema: {
      example: { saved: 1 }
    }
  })
  async saveCategories(@Body() categories: FlatCategory[]): Promise<{ saved: number }> {
    return this.categoriesService.saveCategories(categories);
  }

  // ─────────────────────────────────────────────
  // GET - FULL TREE (flat ordered)
  // ─────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Obtiene todas las categorías (flat)',
    description: `
Devuelve todas las categorías almacenadas.
Ordenadas por level y name.
    `
  })
  @ApiOkResponse({
    type: Array<MercadoLibreCategory>
  })
  async getTree(): Promise<MercadoLibreCategory[]> {
    return this.categoriesService.getTree();
  }

  // ─────────────────────────────────────────────
  // GET - BY ID
  // ─────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene una categoría por ID'
  })
  @ApiParam({ name: 'id', example: 'MLA9304' })
  async getById(@Param('id') id: string): Promise<MercadoLibreCategory | null> {
    return this.categoriesService.getById(id);
  }

  // ─────────────────────────────────────────────
  // GET - CHILDREN
  // ─────────────────────────────────────────────
  @Get('children/list')
  @ApiOperation({
    summary: 'Obtiene hijos directos de una categoría'
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Si es null → devuelve nivel 1',
    example: 'MLA9304'
  })
  async getChildren(@Query('parentId') parentId?: string): Promise<MercadoLibreCategory[]> {
    return this.categoriesService.getChildren(parentId ?? null);
  }

  // ─────────────────────────────────────────────
  // GET - SUBTREE
  // ─────────────────────────────────────────────
  @Get(':id/subtree')
  @ApiOperation({
    summary: 'Obtiene el subárbol completo desde una categoría'
  })
  @ApiParam({ name: 'id', example: 'MLA9304' })
  async getSubTree(@Param('id') id: string): Promise<MercadoLibreCategory[]> {
    return this.categoriesService.getSubTree(id);
  }
}
