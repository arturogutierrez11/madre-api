import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoryMatchService } from 'src/app/services/madre/categories/match/CategoryMatchService';
import { MarketName } from 'src/core/entities/madre/brands/match/MarketName';

@ApiTags('categories')
@Controller('categories')
export class CategoryMatchController {
  constructor(private readonly categoryMatchService: CategoryMatchService) {}

  @Get(':market/match')
  @ApiParam({
    name: 'market',
    enum: MarketName,
    example: MarketName.MEGATONE
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getCategoriesMatch(
    @Param('market', new ParseEnumPipe(MarketName)) market: MarketName,
    @Query('page') page = 1,
    @Query('limit') limit = 50
  ) {
    return this.categoryMatchService.getCategoriesMatchPaginated(market, Number(page), Number(limit));
  }
}
