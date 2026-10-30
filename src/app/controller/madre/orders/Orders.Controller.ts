import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from 'src/app/services/madre/orders/OrdersService';
import { CreateOrdersBatchDTO } from './dto/CreateOrdersBatch.dto';
import { ListOrdersDTO } from './dto/ListOrders.dto';
import { UpdateOrderStatusDTO } from './dto/UpdateOrderStatus.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('batch')
  @ApiOperation({
    summary: 'Persistir un lote de órdenes normalizadas',
    description: `
Inserta un lote de **órdenes normalizadas** (NormalizedOrder) enviadas por **orders-api**.
`
  })
  @ApiBody({ type: CreateOrdersBatchDTO })
  @ApiResponse({
    status: 201,
    description: 'Órdenes procesadas',
    schema: { example: { status: 'ok', total: 10, inserted: 7, skipped: 3 } }
  })
  async insertBatch(@Body() body: CreateOrdersBatchDTO) {
    return this.service.insertBatch(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar órdenes con filtros',
    description: `
Listado paginado (limit/offset) ordenado por fecha de compra, de la más nueva a la más vieja.
No incluye \`source_payload\` ni \`normalized_payload\`: para verlos usar \`GET /api/orders/{uniqueKey}\`.
`
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes',
    schema: {
      example: { items: [], total: 120, limit: 50, offset: 0, count: 50, hasNext: true, nextOffset: 50 }
    }
  })
  async list(@Query() query: ListOrdersDTO) {
    return this.service.list(query);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Listar órdenes pendientes de despacho',
    description: `
Devuelve las órdenes con persistence_status = PENDING, ordenadas por id. Es la cola que lee orders-api.

Máximo 200 por página: si \`nextAfterId\` no es null puede haber más, se piden con \`afterId=nextAfterId\`.
`
  })
  @ApiQuery({ name: 'limit', required: false, example: 50, description: 'Máximo 200' })
  @ApiQuery({ name: 'marketplace', required: false, description: 'Ej. fravega' })
  @ApiQuery({
    name: 'afterId',
    required: false,
    description: 'Devuelve las órdenes con id mayor (nextAfterId de la página anterior)'
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes pendientes',
    schema: { example: { limit: 200, count: 200, nextAfterId: 1234, items: [] } }
  })
  async findPending(
    @Query('limit') limit?: number,
    @Query('marketplace') marketplace?: string,
    @Query('afterId') afterId?: string
  ) {
    return this.service.findPending(limit, {
      marketplace: marketplace || undefined,
      afterId: this.parseAfterId(afterId)
    });
  }

  @Get(':uniqueKey')
  @ApiOperation({
    summary: 'Consultar una orden por unique_key',
    description: 'Permite a orders-api verificar si una orden ya existe antes de procesarla.'
  })
  @ApiParam({ name: 'uniqueKey', example: 'fravega:v90520163frvg-01' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la consulta',
    schema: { example: { exists: true, order: { id: 1, unique_key: 'fravega:v90520163frvg-01' } } }
  })
  async findByUniqueKey(@Param('uniqueKey') uniqueKey: string) {
    return this.service.findByUniqueKey(uniqueKey);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar el estado de orquestación de una orden',
    description: `
Actualiza el estado de procesamiento de una orden
`
  })
  @ApiParam({ name: 'id', description: 'ID (BIGINT) de la orden', example: 1 })
  @ApiBody({ type: UpdateOrderStatusDTO })
  @ApiResponse({ status: 200, description: 'Estado actualizado', schema: { example: { status: 'ok' } } })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateOrderStatusDTO) {
    return this.service.updateStatus(id, body);
  }

  private parseAfterId(afterId?: string): number | undefined {
    if (afterId === undefined || afterId === '') {
      return undefined;
    }

    const value = Number(afterId);
    if (!Number.isInteger(value) || value < 0) {
      throw new BadRequestException('afterId must be a non-negative integer');
    }

    return value;
  }
}
