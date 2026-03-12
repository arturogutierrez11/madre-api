import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PublicationJobsServices } from 'src/app/services/madre/publisher/publication_Jobs/PublicationJobsServices';
import { CreatePublicationJobsDTO } from './dto/CreatePublicationJobs.dto';

import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UpdatePublicationJobDTO } from './dto/UpdatePublicationJobDTO';
import { ClaimPublicationJobsDTO } from './dto/ClaimPublicationJobsDTO';
import { RetryPublicationJobsDTO } from './dto/RetryPublicationJobsDTO';

@ApiTags('Publisher')
@Controller('publication-jobs')
export class PublicationJobsController {
  constructor(private readonly service: PublicationJobsServices) {}

  @ApiOperation({
    summary: 'Crear múltiples publication jobs',
    description: `
Crea múltiples **publication jobs** asociados a un **publication run**.

Cada job representa la publicación de un **SKU en un marketplace específico**.

📌 Notas:
- Este endpoint es consumido por **products-api**
- Usa **bulk insert** para insertar miles de jobs rápidamente
- Todos los jobs se crean con estado inicial **pending**
`
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreatePublicationJobsDTO,
    description: 'Lista de jobs a crear para un publication run'
  })
  @ApiResponse({
    status: 201,
    description: 'Jobs creados correctamente',
    schema: {
      example: {
        status: 'ok',
        jobs_created: 3
      }
    }
  })
  @Post()
  async createJobs(@Body() body: CreatePublicationJobsDTO) {
    return this.service.execute(body);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Obtiene jobs pendientes',
    description: `
Devuelve los **publication jobs pendientes** que deben ser procesados por el worker.

📌 Notas:
- Solo devuelve jobs con status = pending
- El worker usará estos jobs para ejecutar la publicación
`
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de jobs pendientes',
    schema: {
      example: [
        {
          id: 1,
          run_id: 25,
          sku: 'SKU123',
          marketplace: 'meli'
        }
      ]
    }
  })
  async getPending(@Query('limit') limit?: number) {
    return this.service.findPendingJobs(limit || 10);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualiza el estado de un publication job',
    description: `
Permite actualizar el estado de un **publication job** procesado por el worker.

Este endpoint es utilizado por el **worker de publicación** para informar el resultado del procesamiento del job.

Estados posibles:

- **processing** → el worker tomó el job
- **success** → el producto fue publicado correctamente
- **retry** → ocurrió un error temporal y el job debe reintentarse
- **failed** → el job falló definitivamente

📌 Notas:
- Puede guardar el **resultado del marketplace**
- Puede guardar un **mensaje de error**
- Actualiza automáticamente **updated_at**
`
  })
  @ApiParam({
    name: 'id',
    description: 'ID del publication job',
    example: 1
  })
  @ApiBody({
    type: UpdatePublicationJobDTO,
    description: 'Datos para actualizar el job'
  })
  @ApiResponse({
    status: 200,
    description: 'Job actualizado correctamente',
    schema: {
      example: {
        status: 'ok'
      }
    }
  })
  async updateJob(@Param('id') id: string, @Body() body: UpdatePublicationJobDTO) {
    return this.service.updateJob(Number(id), body);
  }

  @Post('claim')
  @ApiOperation({
    summary: 'Reclamar publication jobs pendientes',
    description: `
Permite que un worker reclame jobs pendientes para procesarlos.

El endpoint:

- selecciona jobs con estado **pending**
- los marca como **processing**
- los devuelve al worker

La operación es **transaccional** para evitar que múltiples workers procesen el mismo job.
`
  })
  @ApiBody({
    type: ClaimPublicationJobsDTO
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs reclamados correctamente'
  })
  async claimJobs(@Body() body: ClaimPublicationJobsDTO) {
    return this.service.claimJobs(body.limit);
  }

  @Get(':id/progress')
  @ApiOperation({
    summary: 'Obtiene progreso de publication run',
    description: `
Devuelve estadísticas agregadas de los jobs asociados a un run.

Permite monitorear el progreso del proceso de publicación en tiempo real.
`
  })
  @ApiParam({
    name: 'id',
    example: 25,
    description: 'ID del publication run'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del run',
    schema: {
      example: {
        run_id: 25,
        total: 300,
        pending: 120,
        processing: 10,
        success: 150,
        failed: 20
      }
    }
  })
  async getProgress(@Param('id') id: string) {
    return this.service.getRunProgress(Number(id));
  }

  @Get(':id/jobs')
  @ApiOperation({
    summary: 'Listar jobs de un publication run',
    description: `
Devuelve los jobs asociados a un **publication run**.

Permite monitorear el estado de cada SKU publicado.
`
  })
  @ApiParam({
    name: 'id',
    example: 25,
    description: 'ID del publication run'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 50
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'failed'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de jobs del run'
  })
  async getJobsByRun(
    @Param('id') id: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: string
  ) {
    return this.service.getJobsByRun(id, limit || 50, offset || 0, status);
  }

  @Post('retry')
  @ApiOperation({
    summary: 'Reintentar jobs fallidos',
    description: `
Reintenta los jobs que fallaron en un publication run.

Los jobs con status **failed** vuelven a **pending** para ser reclamados nuevamente por el worker.
`
  })
  @ApiBody({
    type: RetryPublicationJobsDTO
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs reintentados correctamente'
  })
  async retryFailedJobs(@Body() body: RetryPublicationJobsDTO) {
    return this.service.retryFailedJobs(body.run_id);
  }
}
