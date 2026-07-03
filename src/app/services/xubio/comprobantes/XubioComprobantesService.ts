import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ISQLXubioComprobantesRepository,
  XubioComprobanteInput,
  XubioComprobanteSyncRunInput
} from 'src/core/adapters/repositories/xubio/comprobantes/ISQLXubioComprobantesRepository';

@Injectable()
export class XubioComprobantesService {
  constructor(
    @Inject('ISQLXubioComprobantesRepository')
    private readonly repository: ISQLXubioComprobantesRepository
  ) {}

  createSyncRun(input: XubioComprobanteSyncRunInput) {
    return this.repository.createSyncRun(input);
  }

  updateSyncRun(id: number, input: Partial<XubioComprobanteSyncRunInput>) {
    if (!id || Number.isNaN(Number(id))) {
      throw new BadRequestException('id is required');
    }

    return this.repository.updateSyncRun(Number(id), input);
  }

  findSyncRunById(id: number) {
    if (!id || Number.isNaN(Number(id))) {
      throw new BadRequestException('id is required');
    }

    return this.repository.findSyncRunById(Number(id));
  }

  upsertComprobantes(items: XubioComprobanteInput[]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('items must not be empty');
    }

    return this.repository.upsertComprobantes(items);
  }

  findByTlqvCode(tlqvCode: string) {
    const normalized = String(tlqvCode ?? '').trim().toUpperCase();

    if (!normalized) {
      throw new BadRequestException('tlqvCode is required');
    }

    return this.repository.findByTlqvCode(normalized);
  }

  findByTlqvCodes(tlqvCodes: string[]) {
    const normalized = [...new Set(
      (tlqvCodes ?? []).map(code => String(code ?? '').trim().toUpperCase()).filter(Boolean)
    )];

    if (!normalized.length) {
      throw new BadRequestException('tlqvCodes must not be empty');
    }

    return this.repository.findByTlqvCodes(normalized);
  }

  listComprobantes(query: {
    tlqvCode?: string;
    numeroDocumento?: string;
    clienteCodigo?: string;
    mlOrderId?: string;
    documentKind?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repository.listComprobantes({
      ...query,
      tlqvCode: query.tlqvCode ? query.tlqvCode.trim().toUpperCase() : undefined,
      numeroDocumento: query.numeroDocumento?.trim(),
      clienteCodigo: query.clienteCodigo?.trim(),
      mlOrderId: query.mlOrderId?.trim(),
      documentKind: query.documentKind?.trim(),
      fechaDesde: query.fechaDesde?.trim(),
      fechaHasta: query.fechaHasta?.trim(),
      limit: Math.min(Math.max(Number(query.limit) || 50, 1), 500),
      offset: Math.max(Number(query.offset) || 0, 0)
    });
  }

  findExistingClients(clientCodes: string[]) {
    const normalized = [...new Set(
      (clientCodes ?? []).map(code => String(code ?? '').trim()).filter(Boolean)
    )];

    if (!normalized.length) {
      throw new BadRequestException('clientCodes must not be empty');
    }

    return this.repository.findExistingClients(normalized);
  }
}
