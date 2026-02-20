import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsCategoriesService } from 'src/app/services/mercadolibre/analitics/AnalyticsCategoriesService';

@ApiTags('Analytics - Categories')
@Controller('/analytics/categories')
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
}
