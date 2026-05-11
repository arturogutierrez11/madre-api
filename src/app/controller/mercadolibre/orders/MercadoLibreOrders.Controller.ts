import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MercadoLibreOrdersService } from 'src/app/services/mercadolibre/orders/MercadoLibreOrdersService';

@ApiTags('Mercado Libre - Orders')
@Controller('/mercadolibre/orders')
export class MercadoLibreOrdersController {
  constructor(private readonly ordersService: MercadoLibreOrdersService) {}

  @Get('/aporte-ml')
  @ApiOperation({
    summary: 'Obtiene órdenes con aporte_ml desde mayo de 2026',
    description: `
Devuelve todas las órdenes que tienen algún valor en aporte_ml.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
- Filtra fecha_venta desde 2026-05-01
- Responde paginado con cantidad total
    `
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'status', required: false, example: 'paid' })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            id: 10,
            nroVenta: '2000011386890188',
            sku: 'B00BRFIJ2S',
            aporteMl: 4200,
            fechaVenta: '2026-05-02T10:12:00.000Z'
          }
        ],
        total: 43,
        limit: 50,
        offset: 0,
        count: 1,
        hasNext: false,
        nextOffset: null
      }
    }
  })
  async getOrdersWithAporteMl(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('status') status?: string
  ) {
    return this.ordersService.getOrdersWithAporteMl({
      limit: Number(limit),
      offset: Number(offset),
      status
    });
  }

  @Get('/aporte-ml/nro-venta')
  @ApiOperation({
    summary: 'Obtiene nro_venta y aporte_ml desde mayo de 2026',
    description: `
Devuelve un listado paginado con nro_venta, aporte_ml y fecha_venta.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
- Filtra fecha_venta desde 2026-05-01
    `
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'status', required: false, example: 'cancelled' })
  async getOrderAporteMlSummaries(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('status') status?: string
  ) {
    return this.ordersService.getOrderAporteMlSummaries({
      limit: Number(limit),
      offset: Number(offset),
      status
    });
  }

  @Get('/aporte-ml/nro-venta/date-range')
  @ApiOperation({
    summary: 'Obtiene nro_venta y aporte_ml filtrando por rango de fechas',
    description: `
Devuelve un listado paginado con nro_venta, aporte_ml y fecha_venta.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
- Permite filtrar por fromDate y toDate usando fecha_venta
- Si no se envía fromDate, usa 2026-05-01
    `
  })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-05-01 00:00:00' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-05-31 23:59:59' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'status', required: false, example: 'paid' })
  async getOrderAporteMlSummariesByDateRange(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('status') status?: string
  ) {
    return this.ordersService.getOrderAporteMlSummariesByDateRange({
      fromDate,
      toDate,
      limit: Number(limit),
      offset: Number(offset),
      status
    });
  }

  @Get('/analytics/overview')
  @ApiOperation({
    summary: 'Resumen analítico de órdenes con aporte_ml',
    description: `
Devuelve KPIs para dashboard a partir de órdenes con aporte_ml.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
    `
  })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-05-01 00:00:00' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-05-31 23:59:59' })
  @ApiQuery({ name: 'status', required: false, example: 'paid' })
  async getAporteMlOverview(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string
  ) {
    return this.ordersService.getAporteMlOverview({
      fromDate,
      toDate,
      status
    });
  }

  @Get('/analytics/aporte-ml/timeseries')
  @ApiOperation({
    summary: 'Serie temporal de aporte_ml',
    description: `
Devuelve una serie temporal para gráficos por día o por mes.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
    `
  })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-05-01 00:00:00' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-05-31 23:59:59' })
  @ApiQuery({ name: 'status', required: false, example: 'paid' })
  @ApiQuery({ name: 'groupBy', required: false, example: 'day' })
  async getAporteMlTimeSeries(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string,
    @Query('groupBy') groupBy?: string
  ) {
    return {
      items: await this.ordersService.getAporteMlTimeSeries({
        fromDate,
        toDate,
        status,
        groupBy
      })
    };
  }

  @Get('/analytics/by-status')
  @ApiOperation({
    summary: 'Breakdown de órdenes por estado',
    description: `
Devuelve órdenes, revenue y aporte_ml agrupados por estado_orden.

📌 Reglas:
- Solo incluye órdenes con aporte_ml distinto de null y distinto de 0
    `
  })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-05-01 00:00:00' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-05-31 23:59:59' })
  async getOrdersByStatus(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return {
      items: await this.ordersService.getOrdersByStatus({
        fromDate,
        toDate
      })
    };
  }
}
