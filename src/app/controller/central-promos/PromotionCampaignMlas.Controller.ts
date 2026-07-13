import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { PromotionCampaignMlaService } from 'src/app/services/madre/promotion-campaign-mlas/PromotionCampaignMlaService';
import { BulkPromotionCampaignMlaDto } from './dto/BulkPromotionCampaignMla.dto';
import { CreatePromotionCampaignMlaDto } from './dto/CreatePromotionCampaignMla.dto';

@ApiTags('Central Promos - Internal')
@ApiSecurity('internal-api-key')
@Controller('internal/central-promos/campaign-mlas')
@UseGuards(InternalApiKeyGuard)
export class PromotionCampaignMlasController {
  constructor(private readonly service: PromotionCampaignMlaService) {}

  @Post('exists/bulk')
  @ApiOperation({
    summary: 'Consulta en bulk si los MLAs existen en la tabla de campaña'
  })
  @ApiBody({ type: BulkPromotionCampaignMlaDto })
  async checkExistsBulk(@Body() body: BulkPromotionCampaignMlaDto) {
    const items = [...new Set(
      (body.mlas ?? [])
        .map(mla => String(mla ?? '').trim().toUpperCase())
        .filter(Boolean)
    )].map(mla => ({
      mla,
      exists: true
    }));

    return {
      items,
      total: items.length
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lista los MLAs de campaña con paginado'
  })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async list(
    @Query('limit') limit = '10',
    @Query('offset') offset = '0'
  ) {
    return this.service.list(Number(limit), Number(offset));
  }

  @Post()
  @ApiOperation({
    summary: 'Guarda un MLA en la tabla de campaña'
  })
  @ApiBody({ type: CreatePromotionCampaignMlaDto })
  @ApiResponse({
    status: 200,
    description: 'MLA guardado o actualizado'
  })
  async create(@Body() body: CreatePromotionCampaignMlaDto) {
    return this.service.create(body.mla);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Guarda MLAs en bulk en la tabla de campaña'
  })
  @ApiBody({ type: BulkPromotionCampaignMlaDto })
  async createBulk(@Body() body: BulkPromotionCampaignMlaDto) {
    const affected = await this.service.createBulk(body.mlas);

    return {
      status: 'ok',
      totalReceived: [...new Set((body.mlas ?? []).map(mla => String(mla ?? '').trim().toUpperCase()).filter(Boolean))].length,
      affectedRows: affected
    };
  }
}
