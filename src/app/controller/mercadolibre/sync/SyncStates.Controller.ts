import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery, ApiBody } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { SyncStatesService } from 'src/app/services/mercadolibre/sync/SyncStatesService';

@ApiTags('internal-sync')
@Controller('internal/sync-states')
export class SyncStatesController {
  constructor(private readonly syncStatesService: SyncStatesService) {}

  // ======================================================
  // GET STATE
  // ======================================================
  @Get()
  @ApiOperation({
    summary: 'Obtiene el estado de un proceso de sync',
    description: `
Devuelve el estado actual de un proceso de sincronización.

📌 **Uso típico**
- Consultar desde un worker BullMQ
- Saber desde qué offset retomar

📌 **Estados posibles**
- running
- done
- failed
    `
  })
  @ApiQuery({ name: 'process_name', required: true, example: 'items_id_sync' })
  @ApiQuery({ name: 'seller_id', required: true, example: '1757836744' })
  @ApiResponse({
    status: 200,
    description: 'Estado actual del proceso de sync',
    schema: {
      example: {
        process_name: 'items_id_sync',
        seller_id: '1757836744',
        last_offset: 1200,
        status: 'running',
        updated_at: '2026-02-09T20:45:00.000Z'
      }
    }
  })
  async getState(@Query('process_name') processName: string, @Query('seller_id') sellerId: string) {
    return this.syncStatesService.getState({
      processName,
      sellerId
    });
  }

  // ======================================================
  // START SYNC
  // ======================================================
  @Post('start')
  @ApiOperation({
    summary: 'Inicializa un proceso de sync',
    description: `
Crea o reinicia un proceso de sincronización.

📌 **Comportamiento**
- Setea offset = 0
- Status = running
- Se usa al iniciar un sync completo
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['process_name', 'seller_id'],
      properties: {
        process_name: { type: 'string', example: 'items_id_sync' },
        seller_id: { type: 'string', example: '1757836744' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Proceso inicializado correctamente',
    schema: {
      example: { status: 'ok' }
    }
  })
  async start(@Body() body: { process_name: string; seller_id: string }) {
    await this.syncStatesService.start({
      processName: body.process_name,
      sellerId: body.seller_id
    });

    return { status: 'ok' };
  }

  // ======================================================
  // UPDATE OFFSET
  // ======================================================
  @Post('offset')
  @ApiOperation({
    summary: 'Actualiza el offset del sync',
    description: `
Actualiza el último offset procesado.

📌 **Uso típico**
- Al finalizar cada página del paginado
- Permite retomar desde donde falló
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['process_name', 'seller_id', 'last_offset'],
      properties: {
        process_name: { type: 'string', example: 'items_id_sync' },
        seller_id: { type: 'string', example: '1757836744' },
        last_offset: { type: 'number', example: 1250 }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Offset actualizado',
    schema: {
      example: { status: 'ok' }
    }
  })
  async updateOffset(
    @Body()
    body: {
      process_name: string;
      seller_id: string;
      last_offset: number;
    }
  ) {
    await this.syncStatesService.updateOffset({
      processName: body.process_name,
      sellerId: body.seller_id,
      lastOffset: body.last_offset
    });

    return { status: 'ok' };
  }

  // ======================================================
  // MARK DONE
  // ======================================================
  @Post('done')
  @ApiOperation({
    summary: 'Marca el sync como finalizado',
    description: `
Marca el proceso como **done**.

📌 **Uso**
- Cuando BullMQ termina todo el recorrido
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['process_name', 'seller_id', 'last_offset'],
      properties: {
        process_name: { type: 'string', example: 'items_id_sync' },
        seller_id: { type: 'string', example: '1757836744' },
        last_offset: { type: 'number', example: 351000 }
      }
    }
  })
  async markDone(
    @Body()
    body: {
      process_name: string;
      seller_id: string;
      last_offset: number;
    }
  ) {
    await this.syncStatesService.markDone({
      processName: body.process_name,
      sellerId: body.seller_id,
      lastOffset: body.last_offset
    });

    return { status: 'ok' };
  }

  // ======================================================
  // MARK FAILED
  // ======================================================
  @Post('failed')
  @ApiOperation({
    summary: 'Marca el sync como fallido',
    description: `
Marca el proceso como **failed**.

📌 **Uso**
- Cuando BullMQ aborta por error
- El offset queda guardado para retry
    `
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['process_name', 'seller_id', 'last_offset'],
      properties: {
        process_name: { type: 'string', example: 'items_id_sync' },
        seller_id: { type: 'string', example: '1757836744' },
        last_offset: { type: 'number', example: 1240 }
      }
    }
  })
  async markFailed(
    @Body()
    body: {
      process_name: string;
      seller_id: string;
      last_offset: number;
    }
  ) {
    await this.syncStatesService.markFailed({
      processName: body.process_name,
      sellerId: body.seller_id,
      lastOffset: body.last_offset
    });

    return { status: 'ok' };
  }
}
