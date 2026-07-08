import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  ISQLInvoiceClientIssuesRepository,
  InvoiceClientIssuesListFilters,
  InvoiceClientIssueUpdateInput,
  InvoiceClientIssueUpsertInput
} from 'src/core/adapters/repositories/invoice/client-issues/ISQLInvoiceClientIssuesRepository';

@Injectable()
export class InvoiceClientIssuesService {
  constructor(
    @Inject('ISQLInvoiceClientIssuesRepository')
    private readonly repository: ISQLInvoiceClientIssuesRepository
  ) {}

  upsertIssue(input: Omit<InvoiceClientIssueUpsertInput, 'issueKey'>) {
    const tlqvCode = this.normalizeRequiredUpper(input.tlqvCode, 'tlqvCode');
    const reason = this.normalizeRequiredUpper(input.reason, 'reason');
    const source = this.normalizeRequiredLower(input.source, 'source');
    const documentoNroDigits = this.normalizeDigits(input.documentoNroDigits ?? input.documentoNro);
    const issueKey = this.buildIssueKey(tlqvCode, reason, source, documentoNroDigits);

    return this.repository.upsertIssue({
      ...input,
      issueKey,
      tlqvCode,
      reason,
      source,
      severity: this.normalizeOptional(input.severity) ?? 'medium',
      saleNumber: this.normalizeOptional(input.saleNumber),
      buyerName: this.normalizeOptional(input.buyerName),
      email: this.normalizeOptional(input.email),
      documentoTipo: this.normalizeOptional(input.documentoTipo),
      documentoNro: this.normalizeOptional(input.documentoNro),
      documentoNroDigits,
      message: this.normalizeRequired(input.message, 'message'),
      messages: Array.isArray(input.messages)
        ? input.messages.map(message => String(message ?? '').trim()).filter(Boolean)
        : null
    });
  }

  listIssues(query: Partial<InvoiceClientIssuesListFilters>) {
    return this.repository.listIssues({
      tlqvCode: query.tlqvCode ? this.normalizeRequiredUpper(query.tlqvCode, 'tlqvCode') : undefined,
      reason: query.reason ? this.normalizeRequiredUpper(query.reason, 'reason') : undefined,
      source: query.source ? this.normalizeRequiredLower(query.source, 'source') : undefined,
      status: query.status ? this.normalizeRequiredLower(query.status, 'status') : undefined,
      documentoNroDigits: query.documentoNroDigits ? this.normalizeDigits(query.documentoNroDigits) ?? undefined : undefined,
      limit: Math.min(Math.max(Number(query.limit) || 100, 1), 500),
      offset: Math.max(Number(query.offset) || 0, 0)
    });
  }

  findById(id: number) {
    if (!id || Number.isNaN(Number(id))) {
      throw new BadRequestException('id is required');
    }

    return this.repository.findById(Number(id));
  }

  findByTlqvCode(tlqvCode: string) {
    return this.repository.findByTlqvCode(this.normalizeRequiredUpper(tlqvCode, 'tlqvCode'));
  }

  updateIssue(id: number, input: InvoiceClientIssueUpdateInput) {
    if (!id || Number.isNaN(Number(id))) {
      throw new BadRequestException('id is required');
    }

    if (!input || Object.keys(input).length === 0) {
      throw new BadRequestException('body must not be empty');
    }

    return this.repository.updateIssue(Number(id), {
      status: input.status,
      severity: this.normalizeOptional(input.severity),
      resolvedBy: this.normalizeOptional(input.resolvedBy),
      resolutionNotes: this.normalizeOptional(input.resolutionNotes)
    });
  }

  softDeleteIssue(id: number) {
    if (!id || Number.isNaN(Number(id))) {
      throw new BadRequestException('id is required');
    }

    return this.repository.softDeleteIssue(Number(id));
  }

  private buildIssueKey(
    tlqvCode: string,
    reason: string,
    source: string,
    documentoNroDigits: string | null
  ) {
    const parts = [tlqvCode, reason, source];

    if (documentoNroDigits) {
      parts.push(documentoNroDigits);
    }

    return createHash('sha256').update(parts.join('|')).digest('hex');
  }

  private normalizeDigits(value?: string | null) {
    const digits = String(value ?? '').replace(/\D/g, '');
    return digits || null;
  }

  private normalizeOptional(value?: string | null) {
    const normalized = String(value ?? '').trim();
    return normalized || null;
  }

  private normalizeRequired(value: string | undefined, field: string) {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      throw new BadRequestException(`${field} is required`);
    }

    return normalized;
  }

  private normalizeRequiredUpper(value: string | undefined, field: string) {
    return this.normalizeRequired(value, field).toUpperCase();
  }

  private normalizeRequiredLower(value: string | undefined, field: string) {
    return this.normalizeRequired(value, field).toLowerCase();
  }
}
