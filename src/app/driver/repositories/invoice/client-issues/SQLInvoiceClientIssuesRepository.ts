import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ISQLInvoiceClientIssuesRepository,
  InvoiceClientIssuesListFilters,
  InvoiceClientIssuesListResult,
  InvoiceClientIssueRecord,
  InvoiceClientIssueUpdateInput,
  InvoiceClientIssueUpsertInput,
  InvoiceClientIssueUpsertResult
} from 'src/core/adapters/repositories/invoice/client-issues/ISQLInvoiceClientIssuesRepository';

type GenericRow = Record<string, any>;

@Injectable()
export class SQLInvoiceClientIssuesRepository implements ISQLInvoiceClientIssuesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async upsertIssue(input: InvoiceClientIssueUpsertInput): Promise<InvoiceClientIssueUpsertResult> {
    return this.entityManager.transaction(async manager => {
      const existing = await this.findByIssueKey(manager, input.issueKey);

      if (!existing) {
        const result: any = await manager.query(
          `
            INSERT INTO defaultdb.invoice_client_issues (
              issue_key,
              tlqv_code,
              reason,
              source,
              status,
              severity,
              sale_number,
              buyer_name,
              email,
              documento_tipo,
              documento_nro,
              documento_nro_digits,
              message,
              messages_json,
              raw_payload,
              metadata,
              first_seen_at,
              last_seen_at,
              occurrence_count
            )
            VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 1)
          `,
          [
            input.issueKey,
            input.tlqvCode,
            input.reason,
            input.source,
            input.severity ?? 'medium',
            input.saleNumber ?? null,
            input.buyerName ?? null,
            input.email ?? null,
            input.documentoTipo ?? null,
            input.documentoNro ?? null,
            input.documentoNroDigits ?? null,
            input.message,
            this.stringifyJson(input.messages ?? null),
            this.stringifyJson(input.rawPayload ?? null),
            this.stringifyJson(input.metadata ?? null)
          ]
        );

        const created = await this.findByIdWithManager(manager, Number(result.insertId));

        return {
          ...created!,
          created: true,
          updated: false
        };
      }

      const shouldReopen = ['resolved', 'ignored'].includes(String(existing.status ?? '').toLowerCase());
      await manager.query(
        `
          UPDATE defaultdb.invoice_client_issues
          SET
            tlqv_code = ?,
            reason = ?,
            source = ?,
            status = ?,
            severity = ?,
            sale_number = ?,
            buyer_name = ?,
            email = ?,
            documento_tipo = ?,
            documento_nro = ?,
            documento_nro_digits = ?,
            message = ?,
            messages_json = ?,
            raw_payload = ?,
            metadata = ?,
            last_seen_at = NOW(),
            occurrence_count = occurrence_count + 1,
            resolved_at = ?,
            resolved_by = ?,
            resolution_notes = ?,
            deleted_at = NULL,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          input.tlqvCode,
          input.reason,
          input.source,
          shouldReopen ? 'open' : existing.status,
          input.severity ?? existing.severity ?? 'medium',
          input.saleNumber ?? null,
          input.buyerName ?? null,
          input.email ?? null,
          input.documentoTipo ?? null,
          input.documentoNro ?? null,
          input.documentoNroDigits ?? null,
          input.message,
          this.stringifyJson(input.messages ?? null),
          this.stringifyJson(input.rawPayload ?? null),
          this.stringifyJson(input.metadata ?? null),
          shouldReopen ? null : existing.resolvedAt,
          shouldReopen ? null : existing.resolvedBy,
          shouldReopen ? null : existing.resolutionNotes,
          existing.id
        ]
      );

      const updated = await this.findByIdWithManager(manager, existing.id);

      return {
        ...updated!,
        created: false,
        updated: true
      };
    });
  }

  async listIssues(filters: InvoiceClientIssuesListFilters): Promise<InvoiceClientIssuesListResult> {
    const where = ['deleted_at IS NULL'];
    const params: any[] = [];

    this.pushEquals(where, params, 'tlqv_code', filters.tlqvCode);
    this.pushEquals(where, params, 'reason', filters.reason);
    this.pushEquals(where, params, 'source', filters.source);
    this.pushEquals(where, params, 'status', filters.status);
    this.pushEquals(where, params, 'documento_nro_digits', filters.documentoNroDigits);

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.invoice_client_issues
        ${whereClause}
        ORDER BY last_seen_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...params, filters.limit, filters.offset]
    );

    const totalRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM defaultdb.invoice_client_issues
        ${whereClause}
      `,
      params
    );

    return {
      items: rows.map((row: GenericRow) => this.mapIssue(row)),
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: Number(totalRows[0]?.total ?? 0)
      }
    };
  }

  async findById(id: number): Promise<InvoiceClientIssueRecord | null> {
    return this.findByIdWithManager(this.entityManager, id);
  }

  async findByTlqvCode(tlqvCode: string): Promise<InvoiceClientIssueRecord[]> {
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM defaultdb.invoice_client_issues
        WHERE tlqv_code = ?
          AND deleted_at IS NULL
        ORDER BY last_seen_at DESC, id DESC
      `,
      [tlqvCode]
    );

    return rows.map((row: GenericRow) => this.mapIssue(row));
  }

  async updateIssue(id: number, input: InvoiceClientIssueUpdateInput): Promise<InvoiceClientIssueRecord | null> {
    const existing = await this.findById(id);

    if (!existing || existing.deletedAt) {
      return null;
    }

    const updates: string[] = [];
    const params: any[] = [];

    const assign = (column: string, value: unknown) => {
      updates.push(`${column} = ?`);
      params.push(value);
    };

    if (input.status !== undefined) {
      assign('status', input.status);

      if (input.status === 'resolved') {
        updates.push('resolved_at = NOW()');
        assign('resolved_by', input.resolvedBy ?? null);
        assign('resolution_notes', input.resolutionNotes ?? null);
      } else if (input.status === 'open') {
        updates.push('resolved_at = NULL');
        updates.push('resolved_by = NULL');
        updates.push('resolution_notes = NULL');
      } else if (input.status === 'ignored') {
        assign('resolved_by', input.resolvedBy ?? null);
        assign('resolution_notes', input.resolutionNotes ?? null);
      }
    } else {
      if (input.resolvedBy !== undefined) assign('resolved_by', input.resolvedBy);
      if (input.resolutionNotes !== undefined) assign('resolution_notes', input.resolutionNotes);
    }

    if (input.severity !== undefined) {
      assign('severity', input.severity);
    }

    if (!updates.length) {
      return existing;
    }

    updates.push('updated_at = NOW()');

    const result: any = await this.entityManager.query(
      `
        UPDATE defaultdb.invoice_client_issues
        SET ${updates.join(', ')}
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      [...params, id]
    );

    if (Number(result.affectedRows ?? 0) === 0) {
      return null;
    }

    return this.findById(id);
  }

  async softDeleteIssue(id: number): Promise<boolean> {
    const result: any = await this.entityManager.query(
      `
        UPDATE defaultdb.invoice_client_issues
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      [id]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  private async findByIssueKey(manager: EntityManager, issueKey: string): Promise<InvoiceClientIssueRecord | null> {
    const rows = await manager.query(
      `
        SELECT *
        FROM defaultdb.invoice_client_issues
        WHERE issue_key = ?
        LIMIT 1
      `,
      [issueKey]
    );

    if (!rows.length) {
      return null;
    }

    return this.mapIssue(rows[0]);
  }

  private async findByIdWithManager(manager: EntityManager, id: number): Promise<InvoiceClientIssueRecord | null> {
    const rows = await manager.query(
      `
        SELECT *
        FROM defaultdb.invoice_client_issues
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return null;
    }

    return this.mapIssue(rows[0]);
  }

  private pushEquals(where: string[], params: any[], column: string, value?: string) {
    if (value == null || value === '') {
      return;
    }

    where.push(`${column} = ?`);
    params.push(value);
  }

  private stringifyJson(value: unknown) {
    return value == null ? null : JSON.stringify(value);
  }

  private parseJson(value: unknown) {
    if (value == null || value === '') {
      return null;
    }

    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private toIsoString(value: unknown) {
    return value ? new Date(value as string).toISOString() : null;
  }

  private mapIssue(row: GenericRow): InvoiceClientIssueRecord {
    return {
      id: Number(row.id),
      issueKey: String(row.issue_key),
      tlqvCode: String(row.tlqv_code),
      reason: String(row.reason),
      source: String(row.source),
      status: String(row.status),
      severity: String(row.severity),
      saleNumber: row.sale_number ?? null,
      buyerName: row.buyer_name ?? null,
      email: row.email ?? null,
      documentoTipo: row.documento_tipo ?? null,
      documentoNro: row.documento_nro ?? null,
      documentoNroDigits: row.documento_nro_digits ?? null,
      message: String(row.message),
      messages: this.parseJson(row.messages_json) as string[] | null,
      rawPayload: this.parseJson(row.raw_payload),
      metadata: this.parseJson(row.metadata),
      firstSeenAt: this.toIsoString(row.first_seen_at)!,
      lastSeenAt: this.toIsoString(row.last_seen_at)!,
      occurrenceCount: Number(row.occurrence_count ?? 0),
      resolvedAt: this.toIsoString(row.resolved_at),
      resolvedBy: row.resolved_by ?? null,
      resolutionNotes: row.resolution_notes ?? null,
      createdAt: this.toIsoString(row.created_at)!,
      updatedAt: this.toIsoString(row.updated_at)!,
      deletedAt: this.toIsoString(row.deleted_at)
    };
  }
}
