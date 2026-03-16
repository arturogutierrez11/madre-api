import { Body, Controller, Get, Param, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SaveBrandMatchService } from 'src/app/services/madre/brands/match/fravegaBrandsMatch/SaveBrandMatchService';

@ApiTags('brands')
@Controller('matcher')
export class BrandMatchController {
  constructor(private readonly service: SaveBrandMatchService) {}

  @ApiOperation({
    summary: 'Save match between MercadoLibre and Fravega brand'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        meliBrand: {
          type: 'string',
          example: 'Samsung'
        },
        fravegaBrandId: {
          type: 'string',
          example: '604bef2e11000045007b2d18'
        },
        fravegaBrandName: {
          type: 'string',
          example: 'Samsung'
        },
        confidence: {
          type: 'number',
          example: 0.98
        }
      },
      required: ['meliBrand', 'fravegaBrandId', 'fravegaBrandName', 'confidence']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Brand match created',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        created: { type: 'boolean', example: true }
      }
    }
  })
  @Post('brands')
  @HttpCode(200)
  async create(
    @Body()
    body: {
      meliBrand: string;
      fravegaBrandId: string;
      fravegaBrandName: string;
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
    summary: 'Check if a Fravega brand already has a match'
  })
  @ApiParam({
    name: 'id',
    description: 'Fravega brand ID',
    example: '604bef2e11000045007b2d18'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns true if the brand already has a match',
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @Get('brands/fravega/:id/exists')
  async exists(@Param('id') id: string) {
    return this.service.CheckIfBrandExist(id);
  }
}
