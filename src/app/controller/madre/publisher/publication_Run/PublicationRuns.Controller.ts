import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

import { PublicationRunService } from 'src/app/services/madre/publisher/publication_run/PublicationRunService';

import { CreatePublicationRunDto } from './dto/CreatePublicationRun.dto';
import { CreatePublicationRunResponseDto } from './dto/CreatePublicationRunResponse.dto';

@ApiTags('Publisher')
@Controller('publication-runs')
export class PublicationRunsController {
  constructor(private readonly createPublicationRun: PublicationRunService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los publication runs',
    description: 'Devuelve todas las filas de la tabla publication_runs ordenadas por fecha de creación descendente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de publication runs'
  })
  async listRuns() {
    return this.createPublicationRun.listRuns();
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo proceso de publicación',
    description:
      'Crea un publication run que representa un proceso masivo de publicación de SKUs en uno o más marketplaces.'
  })
  @ApiBody({
    type: CreatePublicationRunDto
  })
  @ApiResponse({
    status: 201,
    description: 'Run creado correctamente',
    type: CreatePublicationRunResponseDto
  })
  @Post()
  async create(@Body() body: CreatePublicationRunDto) {
    return this.createPublicationRun.execute(body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtiene un publication run',
    description: `
Devuelve la información completa de un **publication run**.

Permite monitorear el progreso de un proceso de publicación masiva.

📌 Notas:
- Incluye métricas de progreso
- Usado por panel y products-api
`
  })
  @ApiParam({
    name: 'id',
    example: 25,
    description: 'ID del publication run'
  })
  @ApiResponse({
    status: 200,
    description: 'Publication run encontrado',
    schema: {
      example: {
        id: 25,
        status: 'running',
        marketplaces: ['meli', 'fravega'],
        total_jobs: 1000,
        success_jobs: 300,
        failed_jobs: 10,
        created_at: '2026-03-11T18:00:00Z',
        started_at: '2026-03-11T18:01:00Z',
        finished_at: null
      }
    }
  })
  async getRun(@Param('id') id: number) {
    return this.createPublicationRun.getRun(id);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar publication run',
    description: `
Cancela un proceso de publicación masiva.

Los jobs con estado **pending** pasan a **cancelled**.
Los jobs en processing o finalizados no se modifican.
`
  })
  @ApiParam({
    name: 'id',
    example: 25,
    description: 'ID del publication run'
  })
  @ApiResponse({
    status: 200,
    description: 'Run cancelado correctamente',
    schema: {
      example: {
        status: 'cancelled',
        jobs_cancelled: 120
      }
    }
  })
  async cancelRun(@Param('id') id: number) {
    return this.createPublicationRun.cancelRun(Number(id));
  }
}
