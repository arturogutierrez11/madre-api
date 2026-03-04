import { Controller, Get, Param, Query, ParseEnumPipe, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BrandMatchService } from 'src/app/services/madre/brands/match/BrandMatchService';
import { BrandsMatchtoMarket } from 'src/core/entities/madre/brands/match/BrandsMatchtoMarket';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';

@ApiTags('brands')
@Controller('brands')
export class BrandMatchController {
  constructor(private readonly brandMatchService: BrandMatchService) {}

  @Get(':market/match')
  @ApiOperation({
    summary: 'Listar marcas matcheadas por marketplace'
  })
  @ApiParam({
    name: 'market',
    enum: MarketName,
    example: MarketName.ONCITY
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getBrandMatches(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Query('page') page = 1,
    @Query('limit') limit = 50
  ) {
    return this.brandMatchService.getBrandMatchesPaginated(market, Number(page), Number(limit));
  }

  @Post(':market/match')
  @ApiOperation({
    summary: 'Crear o actualizar match de marcas (single o bulk)'
  })
  @ApiParam({
    name: 'market',
    enum: MarketName
  })
  @ApiBody({
    description: 'Puede enviar un objeto o un array de objetos',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            sku: { type: 'string', example: 'B07XLV1XKC' },
            brandId: { type: 'string', example: '2582' },
            brandName: { type: 'string', example: 'Samsonite' }
          },
          required: ['sku', 'brandId', 'brandName']
        },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sku: { type: 'string', example: 'B07XLV1XKC' },
              brandId: { type: 'string', example: '2582' },
              brandName: { type: 'string', example: 'Samsonite' }
            },
            required: ['sku', 'brandId', 'brandName']
          }
        }
      ]
    }
  })
  async createBrandMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Body() body: BrandsMatchtoMarket | BrandsMatchtoMarket[]
  ) {
    return this.brandMatchService.saveBrandMatch(market, body);
  }
}
