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
