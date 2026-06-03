import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlanillaControlService } from 'src/app/services/planilladecontrol/PlanillaControl.Service';

@ApiTags('Planilla Control')
@Controller('internal/planilla-control')
export class PlanillaControlController {
  constructor(private readonly service: PlanillaControlService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear registro en planilla_control',
    description:
      'Acepta columnas normalizadas en snake_case o los nombres originales de la planilla cuando no haya duplicados.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        id: 'TLQV-101',
        identificador: 'TLQV-101',
        nombre_de_tarea: 'EMO CAPO 112',
        fecha_amazon: '2026/05/28',
        sku: 'B0858MYYS9',
        nro_venta: '2000016621010338',
        aporte_ml: '$1.426.226,00'
      }
    }
  })
  async create(@Body() body: Record<string, unknown>) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar registros de planilla_control',
    description: 'Devuelve resultados paginados y permite filtrar por identificador y sku.'
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'identificador', required: false, example: 'TLQV-101' })
  @ApiQuery({ name: 'sku', required: false, example: 'B0858MYYS9' })
  async findAll(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('identificador') identificador?: string,
    @Query('sku') sku?: string
  ) {
    return this.service.findAll({
      limit: Number(limit),
      offset: Number(offset),
      identificador,
      sku
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un registro por id'
  })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un registro por id'
  })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        identificador: 'TLQV-101',
        estado_mercadolibre: 'Pendiente de entrega',
        estado_bue: 'Alerta',
        stock_bue: '0'
      }
    }
  })
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un registro por id'
  })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
