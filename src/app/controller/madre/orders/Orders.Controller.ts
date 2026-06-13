import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from 'src/app/services/madre/orders/OrdersService';
import { CreateOrdersBatchDTO } from './dto/CreateOrdersBatch.dto';
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

  @Get('pending')
  @ApiOperation({
    summary: 'Listar órdenes pendientes de despacho',
    description:
      'Devuelve las órdenes con persistence_status = PENDING. Es la cola que lee el dispatcher de orders-api.'
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Órdenes pendientes' })
  async findPending(@Query('limit') limit?: number) {
    return this.service.findPending(limit);
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
  async updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDTO) {
    return this.service.updateStatus(Number(id), body);
  }
}
