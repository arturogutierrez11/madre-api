import { Controller, Get, Param, Query, ParseEnumPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BrandMatchService } from 'src/app/services/madre/brands/match/BrandMatchService';
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
}
