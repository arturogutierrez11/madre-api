import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AutomeliProductSnapshotsService } from 'src/app/services/automeli/snapshots/AutomeliProductSnapshotsService';
import { GetAutomeliProductSnapshotsBySkusDto } from './dto/GetAutomeliProductSnapshotsBySkus.dto';
import { ListAutomeliProductSnapshotsDto } from './dto/ListAutomeliProductSnapshots.dto';

@ApiTags('Automeli - Product Snapshots')
@Controller('/automeli/product-snapshots')
export class AutomeliProductSnapshotsController {
  constructor(private readonly snapshotsService: AutomeliProductSnapshotsService) {}

  @Get('/last-updated')
  @ApiOperation({
    summary: 'Devuelve la última fecha de actualización de snapshots de Automeli'
  })
  @ApiOkResponse({
    schema: {
      example: {
        total: 726338,
        lastCreatedAt: '2026-05-12T22:47:07.000Z',
        lastUpdatedAt: '2026-06-17T18:00:05.000Z'
      }
    }
  })
  async getLastUpdated() {
    return this.snapshotsService.getLastUpdateInfo();
  }

  @Get('/all')
  @ApiOperation({
    summary: 'Lista paginada de snapshots de Automeli con filtros',
    description: `
Devuelve todos los registros de automeli_product_snapshots con paginado.

📌 Soporta filtros por todos los campos de la tabla:
- texto: mla, sku, brand, title, manufacturingTime, pauseReason, amzStatus, changed, meliStatus, listingTypeId, subStatus, idMeliMainVariant, image, imageChangedUrl, permalink, meliCategoryName, meliMainCategory, shippingFrom
- exactos y rangos para numéricos
- rangos para pausedSince, dateUpdated, dateUpdatedMeli, createdAt y updatedAt
    `
  })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            mla: 'MLA1488473899',
            sku: 'B0BLHBC7JM',
            brand: 'COSORI',
            title: 'Freidora De Aire Compacta Cosori Turboblaze 6.0l Asa, Horn Gris Oscuro',
            manufacturingTime: '11 dias',
            pauseReason: null,
            pausedSince: null,
            totalPrice: 59.01,
            scrapedPrice: 59.01,
            shippingCost: 0,
            taxes: 0,
            stockQuantity: 0,
            amzStatus: 'Agotado',
            changed: '--',
            maxWeight: 1,
            meliSalePrice: 662999,
            discountTotalPrice: 4,
            meliStatus: 'paused',
            listingTypeId: 'gold_special',
            subStatus: 'out_of_stock',
            appStatus: 0,
            idMeliMainVariant: null,
            image: 'https://m.media-amazon.com/images/I/71j8G9EH-DL.jpg',
            imageChanged: 1,
            imageChangedUrl: 'https://m.media-amazon.com/images/I/81R9sA3IyBL.jpg',
            permalink: 'http://articulo.mercadolibre.com.ar/MLA-1424202023-freidora-de-aire-compacta-cosori-turboblaze-60l-asa-horn-_JM',
            meliCategoryName: 'De Aire',
            meliMainCategory: 'Electrodomesticos y Aires Ac.',
            shippingFrom: 'amazon',
            taxCategoryId: 26,
            createUsingPublisher: 1,
            dateUpdated: '2026-06-25T15:00:21.000Z',
            dateUpdatedMeli: '2026-06-25T15:18:31.000Z',
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
      brand: query.brand,
      title: query.title,
      manufacturingTime: query.manufacturingTime,
      pauseReason: query.pauseReason,
      pausedSinceFrom: query.pausedSinceFrom,
      pausedSinceTo: query.pausedSinceTo,
      totalPrice: query.totalPrice != null ? Number(query.totalPrice) : undefined,
      totalPriceMin: query.totalPriceMin != null ? Number(query.totalPriceMin) : undefined,
      totalPriceMax: query.totalPriceMax != null ? Number(query.totalPriceMax) : undefined,
      scrapedPrice: query.scrapedPrice != null ? Number(query.scrapedPrice) : undefined,
      scrapedPriceMin: query.scrapedPriceMin != null ? Number(query.scrapedPriceMin) : undefined,
      scrapedPriceMax: query.scrapedPriceMax != null ? Number(query.scrapedPriceMax) : undefined,
      shippingCost: query.shippingCost != null ? Number(query.shippingCost) : undefined,
      shippingCostMin: query.shippingCostMin != null ? Number(query.shippingCostMin) : undefined,
      shippingCostMax: query.shippingCostMax != null ? Number(query.shippingCostMax) : undefined,
      taxes: query.taxes != null ? Number(query.taxes) : undefined,
      taxesMin: query.taxesMin != null ? Number(query.taxesMin) : undefined,
      taxesMax: query.taxesMax != null ? Number(query.taxesMax) : undefined,
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
      discountTotalPrice:
        query.discountTotalPrice != null ? Number(query.discountTotalPrice) : undefined,
      discountTotalPriceMin:
        query.discountTotalPriceMin != null ? Number(query.discountTotalPriceMin) : undefined,
      discountTotalPriceMax:
        query.discountTotalPriceMax != null ? Number(query.discountTotalPriceMax) : undefined,
      meliStatus: query.meliStatus,
      listingTypeId: query.listingTypeId,
      subStatus: query.subStatus,
      appStatus: query.appStatus != null ? Number(query.appStatus) : undefined,
      idMeliMainVariant: query.idMeliMainVariant,
      image: query.image,
      imageChanged: query.imageChanged != null ? Number(query.imageChanged) : undefined,
      imageChangedUrl: query.imageChangedUrl,
      permalink: query.permalink,
      meliCategoryName: query.meliCategoryName,
      meliMainCategory: query.meliMainCategory,
      shippingFrom: query.shippingFrom,
      taxCategoryId: query.taxCategoryId != null ? Number(query.taxCategoryId) : undefined,
      createUsingPublisher:
        query.createUsingPublisher != null ? Number(query.createUsingPublisher) : undefined,
      dateUpdatedFrom: query.dateUpdatedFrom,
      dateUpdatedTo: query.dateUpdatedTo,
      dateUpdatedMeliFrom: query.dateUpdatedMeliFrom,
      dateUpdatedMeliTo: query.dateUpdatedMeliTo,
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
