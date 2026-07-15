import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { XubioComprobantesService } from 'src/app/services/xubio/comprobantes/XubioComprobantesService';
import { CreateXubioComprobanteSyncRunDto } from './dto/CreateXubioComprobanteSyncRun.dto';
import { GetExistingXubioClientsDto } from './dto/GetExistingXubioClients.dto';
import { GetXubioComprobantesExistsByTlqvCodesDto } from './dto/GetXubioComprobantesExistsByTlqvCodes.dto';
import { GetXubioComprobantesByTlqvCodesDto } from './dto/GetXubioComprobantesByTlqvCodes.dto';
import { UpdateXubioComprobanteSyncRunDto } from './dto/UpdateXubioComprobanteSyncRun.dto';
import { UpsertXubioComprobantesBatchDto } from './dto/UpsertXubioComprobantesBatch.dto';

@ApiTags('Internal Xubio - Comprobantes')
@ApiSecurity('internal-api-key')
@Controller('internal/xubio/comprobantes')
@UseGuards(InternalApiKeyGuard)
export class XubioComprobantesController {
  constructor(private readonly service: XubioComprobantesService) {}

  @Post('sync-runs')
  @ApiOperation({ summary: 'Crear una corrida de sync de comprobantes Xubio' })
  @ApiBody({ type: CreateXubioComprobanteSyncRunDto })
  async createSyncRun(@Body() body: CreateXubioComprobanteSyncRunDto) {
    return this.service.createSyncRun(body);
  }

  @Patch('sync-runs/:id')
  @ApiOperation({ summary: 'Actualizar una corrida de sync de comprobantes Xubio' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateXubioComprobanteSyncRunDto })
  async updateSyncRun(@Param('id') id: string, @Body() body: UpdateXubioComprobanteSyncRunDto) {
    const item = await this.service.updateSyncRun(Number(id), body);

    if (!item) {
      throw new NotFoundException(`Sync run ${id} not found`);
    }

    return item;
  }

  @Get('sync-runs/:id')
  @ApiOperation({ summary: 'Obtener una corrida de sync de comprobantes Xubio' })
  @ApiParam({ name: 'id', example: 1 })
  async findSyncRunById(@Param('id') id: string) {
    const item = await this.service.findSyncRunById(Number(id));

    if (!item) {
      throw new NotFoundException(`Sync run ${id} not found`);
    }

    return item;
  }

  @Post('upsert/batch')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Upsert batch de comprobantes Xubio con sus items hijos'
  })
  @ApiBody({ type: UpsertXubioComprobantesBatchDto })
  @ApiResponse({
    status: 200,
    schema: { example: { total: 2, inserted: 1, updated: 1 } }
  })
  async upsertBatch(@Body() body: UpsertXubioComprobantesBatchDto) {
    return this.service.upsertComprobantes(body.items);
  }

  @Get('by-tlqv-code/:tlqvCode')
  @ApiOperation({ summary: 'Obtener comprobantes Xubio por TLQV code' })
  @ApiParam({ name: 'tlqvCode', example: 'TLQV-101' })
  async findByTlqvCode(@Param('tlqvCode') tlqvCode: string) {
    const items = await this.service.findByTlqvCode(tlqvCode);

    return {
      items,
      total: items.length
    };
  }

  @Get('exists-by-tlqv-code/:tlqvCode')
  @ApiOperation({ summary: 'Saber si un TLQV ya tiene factura válida en Xubio' })
  @ApiParam({ name: 'tlqvCode', example: 'TLQV-7734' })
  async existsByTlqvCode(@Param('tlqvCode') tlqvCode: string) {
    return this.service.existsByTlqvCode(tlqvCode);
  }

  @Post('by-tlqv-codes')
  @ApiOperation({ summary: 'Obtener comprobantes Xubio por múltiples TLQV codes' })
  @ApiBody({ type: GetXubioComprobantesByTlqvCodesDto })
  async findByTlqvCodes(@Body() body: GetXubioComprobantesByTlqvCodesDto) {
    const items = await this.service.findByTlqvCodes(body.tlqvCodes);

    return {
      items,
      total: items.length
    };
  }

  @Post('exists-by-tlqv-codes')
  @ApiOperation({ summary: 'Saber si múltiples TLQV ya tienen factura válida en Xubio' })
  @ApiBody({ type: GetXubioComprobantesExistsByTlqvCodesDto })
  async existsByTlqvCodes(@Body() body: GetXubioComprobantesExistsByTlqvCodesDto) {
    const items = await this.service.existsByTlqvCodes(body.tlqvCodes);

    return {
      items,
      total: items.length
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar comprobantes Xubio con filtros y paginado' })
  @ApiQuery({ name: 'tlqvCode', required: false, example: 'TLQV-101' })
  @ApiQuery({ name: 'numeroDocumento', required: false, example: '0001-00001234' })
  @ApiQuery({ name: 'clienteCodigo', required: false, example: '30652957044' })
  @ApiQuery({ name: 'mlOrderId', required: false, example: '2000016621010338' })
  @ApiQuery({ name: 'documentKind', required: false, example: 'INVOICE' })
  @ApiQuery({ name: 'fechaDesde', required: false, example: '2026-07-01' })
  @ApiQuery({ name: 'fechaHasta', required: false, example: '2026-07-31' })
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    example: false,
    description: 'Si es true, incluye productItems, cobranzaItems y percepcionItems'
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async listComprobantes(
    @Query('tlqvCode') tlqvCode?: string,
    @Query('numeroDocumento') numeroDocumento?: string,
    @Query('clienteCodigo') clienteCodigo?: string,
    @Query('mlOrderId') mlOrderId?: string,
    @Query('documentKind') documentKind?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('includeChildren') includeChildren?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.service.listComprobantes({
      tlqvCode,
      numeroDocumento,
      clienteCodigo,
      mlOrderId,
      documentKind,
      fechaDesde,
      fechaHasta,
      includeChildren: String(includeChildren ?? '').toLowerCase() === 'true',
      limit: limit != null ? Number(limit) : undefined,
      offset: offset != null ? Number(offset) : undefined
    });
  }

  @Post('clients/exists/bulk')
  @ApiOperation({ summary: 'Consultar qué clientes ya existen en Xubio' })
  @ApiBody({ type: GetExistingXubioClientsDto })
  async findExistingClients(@Body() body: GetExistingXubioClientsDto) {
    const items = await this.service.findExistingClients(body.clientCodes);

    return {
      items,
      total: items.length
    };
  }
}
