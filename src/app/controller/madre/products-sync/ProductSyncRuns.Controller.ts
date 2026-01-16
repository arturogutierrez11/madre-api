import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';

import { IProductSyncRunRepository } from 'src/core/adapters/repositories/madre/product-sync/IProductSyncRunRepository';

@ApiTags('Procesos para registrar en sync_runs cunado se inicia un proceso de carga masiva de productos')
@Controller('internal/product-sync/runs')
export class ProductSyncRunsController {
  constructor(
    @Inject('IProductSyncRunRepository')
    private readonly runRepository: IProductSyncRunRepository
  ) {}

  /* =====================================================
     START RUN
  ===================================================== */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Iniciar una ejecución de sincronización' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['marketplace'],
      properties: {
        marketplace: {
          type: 'string',
          example: 'megatone'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Ejecución iniciada',
    schema: {
      example: {
        runId: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123',
        status: 'RUNNING',
        startedAt: '2026-01-15T18:30:12.345Z'
      }
    }
  })
  async start(@Body() body: { marketplace: string }) {
    if (!body.marketplace) {
      throw new BadRequestException('marketplace es obligatorio');
    }

    const runId = await this.runRepository.start(body.marketplace);

    return {
      runId,
      status: 'RUNNING',
      startedAt: new Date().toISOString()
    };
  }

  /* =====================================================
     UPDATE PROGRESS
  ===================================================== */
  @Post('progress')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Actualizar progreso de una ejecución' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['runId'],
      properties: {
        runId: {
          type: 'string',
          example: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123'
        },
        batches: { type: 'number', example: 1 },
        items: { type: 'number', example: 50 },
        failed: { type: 'number', example: 0 }
      }
    }
  })
  @ApiResponse({
    status: 204,
    description: 'Progreso actualizado'
  })
  async updateProgress(
    @Body()
    body: {
      runId: string;
      batches?: number;
      items?: number;
      failed?: number;
    }
  ): Promise<void> {
    if (!body.runId) {
      throw new BadRequestException('runId es obligatorio');
    }

    await this.runRepository.increment(body.runId, {
      batches: body.batches,
      items: body.items,
      failed: body.failed
    });
  }

  /* =====================================================
     FINISH RUN
  ===================================================== */
  @Post('finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar una ejecución correctamente' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['runId', 'status'],
      properties: {
        runId: {
          type: 'string',
          example: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123'
        },
        status: {
          type: 'string',
          enum: ['SUCCESS', 'PARTIAL'],
          example: 'SUCCESS'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Ejecución finalizada',
    schema: {
      example: {
        runId: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123',
        status: 'SUCCESS',
        finishedAt: '2026-01-15T18:42:01.221Z'
      }
    }
  })
  async finish(@Body() body: { runId: string; status: 'SUCCESS' | 'PARTIAL' }) {
    if (!body.runId) {
      throw new BadRequestException('runId es obligatorio');
    }

    await this.runRepository.finish(body.runId, body.status);

    return {
      runId: body.runId,
      status: body.status,
      finishedAt: new Date().toISOString()
    };
  }

  /* =====================================================
     FAIL RUN
  ===================================================== */
  @Post('fail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar una ejecución como fallida' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['runId', 'errorMessage'],
      properties: {
        runId: {
          type: 'string',
          example: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123'
        },
        errorMessage: {
          type: 'string',
          example: 'Timeout consultando marketplace Megatone'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Ejecución marcada como FAILED',
    schema: {
      example: {
        runId: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123',
        status: 'FAILED',
        errorMessage: 'Timeout consultando marketplace Megatone',
        finishedAt: '2026-01-15T18:35:55.902Z'
      }
    }
  })
  async fail(@Body() body: { runId: string; errorMessage: string }) {
    if (!body.runId || !body.errorMessage) {
      throw new BadRequestException('runId y errorMessage son obligatorios');
    }

    await this.runRepository.fail(body.runId, body.errorMessage);

    return {
      runId: body.runId,
      status: 'FAILED',
      errorMessage: body.errorMessage,
      finishedAt: new Date().toISOString()
    };
  }

  /* =====================================================
     LIST RUNS
  ===================================================== */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar ejecuciones de sincronización' })
  @ApiQuery({ name: 'marketplace', required: true, example: 'megatone' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Listado de ejecuciones',
    schema: {
      example: {
        items: [
          {
            id: '9d2b8c7a-1c4a-4c31-9c9b-2d5c8cddf123',
            marketplace: 'megatone',
            status: 'SUCCESS',
            batches_processed: 81,
            items_processed: 4023,
            items_failed: 3,
            started_at: '2026-01-15T18:30:12.345Z',
            finished_at: '2026-01-15T18:42:01.221Z',
            error_message: null
          }
        ],
        limit: 20,
        offset: 0
      }
    }
  })
  async list(
    @Query('marketplace') marketplace: string,
    @Query('limit') limitRaw = '20',
    @Query('offset') offsetRaw = '0'
  ) {
    if (!marketplace) {
      throw new BadRequestException('marketplace es obligatorio');
    }

    const limit = Math.min(Number(limitRaw) || 20, 100);
    const offset = Number(offsetRaw) || 0;

    const items = await this.runRepository.list(marketplace, limit, offset);

    return {
      items,
      limit,
      offset
    };
  }
}
