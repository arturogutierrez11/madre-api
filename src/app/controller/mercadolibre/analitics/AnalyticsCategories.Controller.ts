import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AnalyticsCategoriesService } from 'src/app/services/mercadolibre/analitics/AnalyticsCategoriesService';
import { BulkAddFavoritesDto } from './dto/BulkAddFavoritesDto';

@ApiTags('Analytics - Categories')
@Controller('analytics/categories')
export class AnalyticsCategoriesController {
  constructor(private readonly analyticsService: AnalyticsCategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Performance por categoría',
    description: `
Devuelve métricas agregadas por categoría de MercadoLibre.

📊 Métricas incluidas:
- Visits
- Orders
- Revenue
- Avg Ticket
- Conversion Rate

📌 Permite:
- Filtrar por categoryId
- Ordenar por métrica
- Elegir dirección de orden
    `
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filtrar por categoría específica',
    example: 'MLA37617'
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['visits', 'orders', 'revenue', 'conversion'],
    description: 'Campo por el cual ordenar',
    example: 'visits'
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección de ordenamiento',
    example: 'desc'
  })
  @ApiOkResponse({
    description: 'Listado de métricas por categoría',
    schema: {
      example: [
        {
          categoryId: 'MLA37617',
          visits: 1240,
          orders: 87,
          revenue: 2450000,
          avgTicket: 28160,
          conversionRate: 7.01
        },
        {
          categoryId: 'MLA1246',
          visits: 890,
          orders: 40,
          revenue: 980000,
          avgTicket: 24500,
          conversionRate: 4.49
        }
      ]
    }
  })
  async getCategoriesPerformance(
    @Query('categoryId') categoryId?: string,
    @Query('orderBy') orderBy?: 'visits' | 'orders' | 'revenue' | 'conversion',
    @Query('direction') direction?: 'asc' | 'desc'
  ) {
    return this.analyticsService.getCategoriesPerformance({
      categoryId,
      orderBy,
      direction
    });
  }

  @Get('/available')
  @ApiOperation({
    summary: 'Obtiene categorías disponibles con productos',
    description: `
Devuelve solo las categorías donde existen productos cargados.

Ideal para:
- Dropdown de filtros
- Selector de categorías en dashboard
`
  })
  @ApiOkResponse({
    schema: {
      example: [
        { id: 'MLA37617', name: 'Walkie Talkies' },
        { id: 'MLA126134', name: 'Cámaras de Seguridad' }
      ]
    }
  })
  async getAvailableCategories() {
    return this.analyticsService.getAvailableCategories();
  }

  // ─────────────────────────────────────────────
  // GET - PARENT CATEGORIES PERFORMANCE (Executive)
  // ─────────────────────────────────────────────
  @Get('parents-performance')
  @ApiOperation({
    summary: 'Obtiene performance agregada por categorías padre',
    description: `
Devuelve métricas ejecutivas agregadas por categoría padre.
Incluye toda la rama (hijos y subhijos).
`
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['visits', 'orders', 'revenue'],
    example: 'visits'
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          categoryId: 'MLA5725',
          categoryName: 'Accesorios para Vehículos',
          visits: 240000,
          orders: 530,
          revenue: 82000000
        }
      ]
    }
  })
  async getParentCategoriesPerformance(
    @Query('orderBy') orderBy?: 'visits' | 'orders' | 'revenue',
    @Query('direction') direction?: 'asc' | 'desc'
  ) {
    return this.analyticsService.getParentCategoriesPerformance({
      orderBy,
      direction
    });
  }

  // ─────────────────────────────────────────────
  // GET - CHILDREN PERFORMANCE (Hierarchical)
  // ─────────────────────────────────────────────
  @Get('children')
  @ApiOperation({
    summary: 'Obtiene categorías hijas directas con métricas (modo jerárquico)'
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Si es null → devuelve categorías padre (nivel 1)',
    example: 'MLA1000'
  })
  async getChildrenPerformance(@Query('parentId') parentId?: string) {
    return this.analyticsService.getChildrenPerformance(parentId);
  }

  @Get(':categoryId/products')
  @ApiOperation({
    summary: 'Obtiene productos de una categoría con paginado y filtros'
  })
  @ApiParam({
    name: 'categoryId',
    required: true,
    example: 'MLA438233'
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'minPrice', required: false, example: 10000 })
  @ApiQuery({ name: 'maxPrice', required: false, example: 500000 })
  @ApiQuery({ name: 'minVisits', required: false, example: 10 })
  @ApiQuery({ name: 'maxVisits', required: false, example: 1000 })
  @ApiQuery({ name: 'minOrders', required: false, example: 1 })
  @ApiQuery({ name: 'maxOrders', required: false, example: 100 })
  @ApiQuery({ name: 'minRevenue', required: false, example: 10000 })
  @ApiQuery({ name: 'maxRevenue', required: false, example: 1000000 })
  @ApiQuery({
    name: 'excludeMarketplace',
    required: false,
    example: 'megatone,oncity',
    description: `
Excluye productos publicados en uno o más marketplaces.
Separar múltiples marketplaces con coma.
Ejemplo:
?excludeMarketplace=megatone,oncity
`
  })
  async getCategoryProducts(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minVisits') minVisits?: string,
    @Query('maxVisits') maxVisits?: string,
    @Query('minOrders') minOrders?: string,
    @Query('maxOrders') maxOrders?: string,
    @Query('minRevenue') minRevenue?: string,
    @Query('maxRevenue') maxRevenue?: string,
    @Query('excludeMarketplace') excludeMarketplace?: string
  ) {
    const safePage = page !== undefined && !isNaN(Number(page)) ? Math.max(1, Number(page)) : 1;

    const safeLimit = limit !== undefined && !isNaN(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;

    const excludeMarketplaceArray =
      typeof excludeMarketplace === 'string'
        ? excludeMarketplace
            .split(',')
            .map(m => m.trim())
            .filter(Boolean)
        : undefined;

    return this.analyticsService.getCategoryProducts(categoryId, safePage, safeLimit, {
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      minVisits: minVisits !== undefined ? Number(minVisits) : undefined,
      maxVisits: maxVisits !== undefined ? Number(maxVisits) : undefined,
      minOrders: minOrders !== undefined ? Number(minOrders) : undefined,
      maxOrders: maxOrders !== undefined ? Number(maxOrders) : undefined,
      minRevenue: minRevenue !== undefined ? Number(minRevenue) : undefined,
      maxRevenue: maxRevenue !== undefined ? Number(maxRevenue) : undefined,
      excludeMarketplace: excludeMarketplaceArray
    });
  }
}
