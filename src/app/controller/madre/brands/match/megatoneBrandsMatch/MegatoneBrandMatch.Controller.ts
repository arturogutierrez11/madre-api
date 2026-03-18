import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SaveMegatoneBrandMatchService } from 'src/app/services/madre/brands/match/megatoneBrandsMatch/megatoneBrandsMatch';

@ApiTags('brands')
@Controller('matcher')
export class MegatoneBrandMatchController {
  constructor(private readonly service: SaveMegatoneBrandMatchService) {}

  @ApiOperation({
    summary: 'Save match between MercadoLibre and Megatone brand'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        meliBrand: { type: 'string', example: 'Samsung' },
        megatoneBrandId: { type: 'string', example: '12345' },
        megatoneBrandName: { type: 'string', example: 'Samsung' },
        confidence: { type: 'number', example: 0.98 }
      },
      required: ['meliBrand', 'megatoneBrandId', 'megatoneBrandName', 'confidence']
    }
  })
  @Post('brands/megatone')
  @HttpCode(200)
  async create(
    @Body()
    body: {
      meliBrand: string;
      megatoneBrandId: string;
      megatoneBrandName: string;
      confidence: number;
    }
  ) {
    await this.service.execute(body);

    return {
      status: 'ok',
      created: true
    };
  }

  @ApiOperation({
    summary: 'Check if a Megatone brand already has a match'
  })
  @ApiParam({
    name: 'id',
    description: 'Megatone brand ID',
    example: '12345'
  })
  @Get('brands/megatone/:id/exists')
  async exists(@Param('id') id: string) {
    return this.service.checkIfBrandExist(id);
  }
}
