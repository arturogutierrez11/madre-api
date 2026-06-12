import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AutomeliProductSnapshotsService } from 'src/app/services/automeli/snapshots/AutomeliProductSnapshotsService';
import { GetAutomeliProductSnapshotsBySkusDto } from './dto/GetAutomeliProductSnapshotsBySkus.dto';
import { ListAutomeliProductSnapshotsDto } from './dto/ListAutomeliProductSnapshots.dto';

@ApiTags('Automeli - Product Snapshots')
@Controller('/automeli/product-snapshots')
export class AutomeliProductSnapshotsController {
  constructor(private readonly snapshotsService: AutomeliProductSnapshotsService) {}

  @Get('/all')
  @ApiOperation({
    summary: 'Lista paginada de snapshots de Automeli con filtros',
    description: `
Devuelve todos los registros de automeli_product_snapshots con paginado.

📌 Soporta filtros por todos los campos de la tabla:
- texto: mla, sku, amzStatus, changed, meliStatus, listingTypeId, subStatus
- exactos y rangos para numéricos
- rangos para createdAt y updatedAt
    `
  })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            mla: 'MLA1488473899',
            sku: 'B0BLHBC7JM',
            totalPrice: 59.01,
            scrapedPrice: 59.01,
            stockQuantity: 0,
            amzStatus: 'Agotado',
            changed: '--',
            maxWeight: 1,
            meliSalePrice: 662999,
            meliStatus: 'paused',
            listingTypeId: 'gold_special',
            subStatus: 'out_of_stock',
            appStatus: 0,
            createdAt: '2026-05-12T12:00:00.000Z',
            updatedAt: '2026-05-12T12:00:00.000Z'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        count: 1,
        hasNext: false,
        nextOffset: null
      }
    }
  })
  async listAll(@Query() query: ListAutomeliProductSnapshotsDto) {
    return this.snapshotsService.findAll({
      limit: query.limit != null ? Number(query.limit) : 50,
      offset: query.offset != null ? Number(query.offset) : 0,
      mla: query.mla,
      sku: query.sku,
      totalPrice: query.totalPrice != null ? Number(query.totalPrice) : undefined,
      totalPriceMin: query.totalPriceMin != null ? Number(query.totalPriceMin) : undefined,
      totalPriceMax: query.totalPriceMax != null ? Number(query.totalPriceMax) : undefined,
      scrapedPrice: query.scrapedPrice != null ? Number(query.scrapedPrice) : undefined,
      scrapedPriceMin: query.scrapedPriceMin != null ? Number(query.scrapedPriceMin) : undefined,
      scrapedPriceMax: query.scrapedPriceMax != null ? Number(query.scrapedPriceMax) : undefined,
      stockQuantity: query.stockQuantity != null ? Number(query.stockQuantity) : undefined,
      stockQuantityMin: query.stockQuantityMin != null ? Number(query.stockQuantityMin) : undefined,
      stockQuantityMax: query.stockQuantityMax != null ? Number(query.stockQuantityMax) : undefined,
      amzStatus: query.amzStatus,
      changed: query.changed,
      maxWeight: query.maxWeight != null ? Number(query.maxWeight) : undefined,
      maxWeightMin: query.maxWeightMin != null ? Number(query.maxWeightMin) : undefined,
      maxWeightMax: query.maxWeightMax != null ? Number(query.maxWeightMax) : undefined,
      meliSalePrice: query.meliSalePrice != null ? Number(query.meliSalePrice) : undefined,
      meliSalePriceMin: query.meliSalePriceMin != null ? Number(query.meliSalePriceMin) : undefined,
      meliSalePriceMax: query.meliSalePriceMax != null ? Number(query.meliSalePriceMax) : undefined,
      meliStatus: query.meliStatus,
      listingTypeId: query.listingTypeId,
      subStatus: query.subStatus,
      appStatus: query.appStatus != null ? Number(query.appStatus) : undefined,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
      updatedAtFrom: query.updatedAtFrom,
      updatedAtTo: query.updatedAtTo
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Busca snapshots de Automeli por SKU',
    description: `
Permite consultar múltiples SKUs por query param.

Formatos soportados:
- skus=B001,B002
- skus=B001&skus=B002
    `
  })
  @ApiQuery({ name: 'skus', required: true, isArray: true, example: ['B0C33CHG99', 'B001RCD2DW'] })
  @ApiQuery({ name: 'fields', required: false, isArray: true, example: ['sku', 'totalPrice', 'maxWeight'] })
  @ApiQuery({ name: 'uniqueBySku', required: false, example: true })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            sku: 'B0BLHBC7JM',
            totalPrice: 59.01,
            maxWeight: 1
          }
        ],
        total: 1
      }
    }
  })
  async getBySkus(
    @Query('skus') skus: string | string[],
    @Query('fields') fields?: string | string[],
    @Query('uniqueBySku') uniqueBySku?: string
  ) {
    const normalized = Array.isArray(skus)
      ? skus.flatMap(value => String(value).split(','))
      : String(skus ?? '').split(',');

    const normalizedFields = Array.isArray(fields)
      ? fields.flatMap(value => String(value).split(','))
      : fields ? String(fields).split(',') : undefined;

    return this.snapshotsService.findBySkus({
      skus: normalized,
      fields: normalizedFields,
      uniqueBySku: uniqueBySku === 'true'
    });
  }

  @Post('/search')
  @ApiOperation({
    summary: 'Busca snapshots de Automeli por SKU en bulk'
  })
  @ApiBody({ type: GetAutomeliProductSnapshotsBySkusDto })
  async searchBySkus(@Body() body: GetAutomeliProductSnapshotsBySkusDto) {
    return this.snapshotsService.findBySkus({
      skus: body.skus,
      fields: body.fields,
      uniqueBySku: body.uniqueBySku
    });
  }
}
