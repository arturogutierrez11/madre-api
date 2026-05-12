import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AutomeliProductSnapshotsService } from 'src/app/services/automeli/snapshots/AutomeliProductSnapshotsService';
import { GetAutomeliProductSnapshotsBySkusDto } from './dto/GetAutomeliProductSnapshotsBySkus.dto';

@ApiTags('Automeli - Product Snapshots')
@Controller('/automeli/product-snapshots')
export class AutomeliProductSnapshotsController {
  constructor(private readonly snapshotsService: AutomeliProductSnapshotsService) {}

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
            appStatus: 1,
            createdAt: '2026-05-12T12:00:00.000Z',
            updatedAt: '2026-05-12T12:00:00.000Z'
          }
        ],
        total: 1
      }
    }
  })
  async getBySkus(@Query('skus') skus: string | string[]) {
    const normalized = Array.isArray(skus)
      ? skus.flatMap(value => String(value).split(','))
      : String(skus ?? '').split(',');

    return this.snapshotsService.findBySkus(normalized);
  }

  @Post('/search')
  @ApiOperation({
    summary: 'Busca snapshots de Automeli por SKU en bulk'
  })
  @ApiBody({ type: GetAutomeliProductSnapshotsBySkusDto })
  async searchBySkus(@Body() body: GetAutomeliProductSnapshotsBySkusDto) {
    return this.snapshotsService.findBySkus(body.skus);
  }
}
