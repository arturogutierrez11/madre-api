import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { ISkuPauseFlagRepository } from 'src/core/adapters/repositories/madre/product-sync/ISkuPauseFlagRepository';
import { BulkUpsertSkuPauseFlagsDto } from './dto/BulkUpsertSkuPauseFlags.dto';
import { GetSkuPauseFlagsBySkusDto } from './dto/GetSkuPauseFlagsBySkus.dto';
import { UpsertSkuPauseFlagDto } from './dto/UpsertSkuPauseFlag.dto';

@ApiTags('Procesos internos · Sincronización de Productos - Sync_items')
@ApiSecurity('internal-api-key')
@Controller('internal/marketplace/products/paused-skus')
@UseGuards(InternalApiKeyGuard)
export class SkuPauseFlagsController {
  constructor(
    @Inject('ISkuPauseFlagRepository')
    private readonly skuPauseFlagRepository: ISkuPauseFlagRepository
  ) {}

  @Put('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar el flag paused de múltiples SKUs'
  })
  @ApiBody({ type: BulkUpsertSkuPauseFlagsDto })
  async bulkUpsert(@Body() body: BulkUpsertSkuPauseFlagsDto) {
    const items = body.items.map(item => ({
      sku: String(item.sku ?? '').trim().toUpperCase(),
      paused: Boolean(item.paused)
    }));

    const result = await this.skuPauseFlagRepository.bulkUpsert(items);

    return {
      items: result,
      total: result.length
    };
  }

  @Put(':sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar el flag paused de un SKU'
  })
  @ApiParam({ name: 'sku', example: 'B0C33CHG99' })
  @ApiBody({
    schema: {
      example: {
        paused: true
      }
    }
  })
  async upsertByParam(
    @Param('sku') sku: string,
    @Body() body: Omit<UpsertSkuPauseFlagDto, 'sku'>
  ) {
    const item = await this.skuPauseFlagRepository.upsert(String(sku ?? '').trim().toUpperCase(), Boolean(body.paused));

    return item;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar el flag paused de un SKU por body'
  })
  @ApiBody({ type: UpsertSkuPauseFlagDto })
  async upsert(@Body() body: UpsertSkuPauseFlagDto) {
    return this.skuPauseFlagRepository.upsert(String(body.sku ?? '').trim().toUpperCase(), Boolean(body.paused));
  }

  @Get('skus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar todos los SKUs de la tabla de pause flags'
  })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async listSkus(
    @Query('limit') limit = '100',
    @Query('offset') offset = '0'
  ) {
    const parsedLimit = Math.min(Number(limit) || 100, 500);
    const parsedOffset = Number(offset) || 0;

    const [items, summary] = await Promise.all([
      this.skuPauseFlagRepository.listSkus(parsedLimit, parsedOffset),
      this.skuPauseFlagRepository.list({
        limit: parsedLimit,
        offset: parsedOffset
      })
    ]);

    return {
      items,
      limit: parsedLimit,
      offset: parsedOffset,
      count: items.length,
      total: summary.total,
      hasNext: summary.hasNext,
      nextOffset: summary.nextOffset
    };
  }

  @Get(':sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener el flag paused de un SKU'
  })
  @ApiParam({ name: 'sku', example: 'B0C33CHG99' })
  async findBySku(@Param('sku') sku: string) {
    const item = await this.skuPauseFlagRepository.findBySku(String(sku ?? '').trim().toUpperCase());

    if (!item) {
      throw new NotFoundException(`No se encontró configuración para sku ${sku}`);
    }

    return item;
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar rápido el flag paused de múltiples SKUs'
  })
  @ApiBody({ type: GetSkuPauseFlagsBySkusDto })
  async findBySkus(@Body() body: GetSkuPauseFlagsBySkusDto) {
    const items = await this.skuPauseFlagRepository.findBySkus(
      [...new Set(body.skus.map(sku => String(sku ?? '').trim().toUpperCase()).filter(Boolean))]
    );

    return {
      items,
      total: items.length
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar SKUs con su flag paused'
  })
  @ApiQuery({ name: 'sku', required: false, example: 'B0C33CHG99' })
  @ApiQuery({ name: 'paused', required: false, example: true })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async list(
    @Query('sku') sku?: string,
    @Query('paused') paused?: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0'
  ) {
    const normalizedPaused =
      paused == null || paused === ''
        ? undefined
        : ['true', '1'].includes(String(paused).trim().toLowerCase());

    return this.skuPauseFlagRepository.list({
      sku: sku?.trim().toUpperCase(),
      paused: normalizedPaused,
      limit: Math.min(Number(limit) || 100, 500),
      offset: Number(offset) || 0
    });
  }

  @Delete(':sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar la configuración paused de un SKU'
  })
  @ApiParam({ name: 'sku', example: 'B0C33CHG99' })
  async deleteBySku(@Param('sku') sku: string) {
    const deleted = await this.skuPauseFlagRepository.deleteBySku(String(sku ?? '').trim().toUpperCase());

    if (!deleted) {
      throw new NotFoundException(`No se encontró configuración para sku ${sku}`);
    }

    return {
      sku: String(sku ?? '').trim().toUpperCase(),
      deleted: true
    };
  }
}
