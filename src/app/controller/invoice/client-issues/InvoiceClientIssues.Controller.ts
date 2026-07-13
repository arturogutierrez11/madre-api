import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { InvoiceClientIssuesService } from 'src/app/services/invoice/client-issues/InvoiceClientIssuesService';
import { ListInvoiceClientIssueClientsDto } from './dto/ListInvoiceClientIssueClients.dto';
import { ListInvoiceClientIssuesDto } from './dto/ListInvoiceClientIssues.dto';
import { UpdateInvoiceClientIssueDto } from './dto/UpdateInvoiceClientIssue.dto';
import { UpsertInvoiceClientIssueDto } from './dto/UpsertInvoiceClientIssue.dto';

@ApiTags('Internal Invoice - Client Issues')
@ApiSecurity('internal-api-key')
@Controller('internal/invoice/client-issues')
@UseGuards(InternalApiKeyGuard)
export class InvoiceClientIssuesController {
  constructor(private readonly service: InvoiceClientIssuesService) {}

  @Post('upsert')
  @ApiOperation({ summary: 'Crear o actualizar un issue de cliente de facturación' })
  @ApiBody({ type: UpsertInvoiceClientIssueDto })
  async upsert(@Body() body: UpsertInvoiceClientIssueDto) {
    return this.service.upsertIssue(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar issues de clientes de facturación' })
  @ApiQuery({ name: 'tlqvCode', required: false, example: 'TLQV-14921' })
  @ApiQuery({ name: 'reason', required: false, example: 'INVALID_FISCAL_DOCUMENT' })
  @ApiQuery({ name: 'source', required: false, example: 'tus_facturas' })
  @ApiQuery({ name: 'status', required: false, example: 'open' })
  @ApiQuery({ name: 'documentoNroDigits', required: false, example: '20111111114' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async list(@Query() query: ListInvoiceClientIssuesDto) {
    return this.service.listIssues(query);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Listar clientes guardados en invoice_client_issues' })
  @ApiQuery({ name: 'tlqvCode', required: false, example: 'TLQV-14921' })
  @ApiQuery({ name: 'buyerName', required: false, example: 'ARTURO GUTIERREZ' })
  @ApiQuery({ name: 'email', required: false, example: 'mail@test.com' })
  @ApiQuery({ name: 'documentoNroDigits', required: false, example: '20111111114' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  async listClients(@Query() query: ListInvoiceClientIssueClientsDto) {
    return this.service.listClients(query);
  }

  @Get('by-tlqv-code/:tlqvCode')
  @ApiOperation({ summary: 'Obtener issues por TLQV code' })
  @ApiParam({ name: 'tlqvCode', example: 'TLQV-14921' })
  async findByTlqvCode(@Param('tlqvCode') tlqvCode: string) {
    const items = await this.service.findByTlqvCode(tlqvCode);

    return {
      tlqvCode: tlqvCode.trim().toUpperCase(),
      items
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener issue por id' })
  @ApiParam({ name: 'id', example: 123 })
  async findById(@Param('id') id: string) {
    const item = await this.service.findById(Number(id));

    if (!item) {
      throw new NotFoundException(`Invoice client issue ${id} not found`);
    }

    return item;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar issue' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateInvoiceClientIssueDto })
  async update(@Param('id') id: string, @Body() body: UpdateInvoiceClientIssueDto) {
    const item = await this.service.updateIssue(Number(id), body);

    if (!item) {
      throw new NotFoundException(`Invoice client issue ${id} not found`);
    }

    return item;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete de issue' })
  @ApiParam({ name: 'id', example: 123 })
  async delete(@Param('id') id: string) {
    const deleted = await this.service.softDeleteIssue(Number(id));

    if (!deleted) {
      throw new NotFoundException(`Invoice client issue ${id} not found`);
    }

    return {
      id: Number(id),
      deleted: true
    };
  }
}
