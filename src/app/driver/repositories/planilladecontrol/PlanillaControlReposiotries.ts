import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  IPlanillaControlRepository,
  PlanillaControlListParams
} from 'src/core/adapters/repositories/planilladecontrol/IPlanillaControlRepository';
import {
  PLANILLA_CONTROL_COLUMNS,
  PlanillaControlColumn,
  PlanillaControlPayload
} from 'src/core/entities/planilladecontrol/PlanillaControl';

@Injectable()
export class PlanillaControlReposiotries implements IPlanillaControlRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(id: string, payload: PlanillaControlPayload): Promise<any> {
    const prepared = this.preparePayload(payload);
    if (!prepared.identificador) {
      prepared.identificador = id;
    }
    const columns = ['id', ...Object.keys(prepared)] as Array<
      PlanillaControlColumn | 'id'
    >;

    if (!columns.length) {
      throw new Error('No valid columns provided for insert');
    }

    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(column => {
      if (column === 'id') return id;
      return prepared[column];
    });

    const result: any = await this.entityManager.query(
      `
        INSERT INTO planilla_control (${columns.map(column => `\`${column}\``).join(', ')})
        VALUES (${placeholders})
      `,
      values
    );

    return this.findById(id);
  }

  async findAll(params: PlanillaControlListParams) {
    const safeLimit = Math.min(Math.max(Number(params.limit) || 50, 1), 500);
    const safeOffset = Math.max(Number(params.offset) || 0, 0);

    const where: string[] = [];
    const values: any[] = [];

    if (params.identificador?.trim()) {
      where.push('identificador LIKE ?');
      values.push(`%${params.identificador.trim()}%`);
    }

    if (params.sku?.trim()) {
      where.push('sku LIKE ?');
      values.push(`%${params.sku.trim()}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const items = await this.entityManager.query(
      `
        SELECT *
        FROM planilla_control
        ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...values, safeLimit, safeOffset]
    );

    const countRows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM planilla_control
        ${whereClause}
      `,
      values
    );

    const total = Number(countRows[0]?.total ?? 0);
    const hasNext = safeOffset + safeLimit < total;

    return {
      items,
      total,
      limit: safeLimit,
      offset: safeOffset,
      count: items.length,
      hasNext,
      nextOffset: hasNext ? safeOffset + safeLimit : null
    };
  }

  async findById(id: string): Promise<any | null> {
    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM planilla_control
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  async update(id: string, payload: PlanillaControlPayload): Promise<any | null> {
    const prepared = this.preparePayload(payload);
    const columns = Object.keys(prepared) as PlanillaControlColumn[];

    if (!columns.length) {
      return this.findById(id);
    }

    const setClause = columns.map(column => `\`${column}\` = ?`).join(', ');
    const values = columns.map(column => prepared[column]);

    await this.entityManager.query(
      `
        UPDATE planilla_control
        SET ${setClause},
            updated_at = NOW()
        WHERE id = ?
      `,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result: any = await this.entityManager.query(
      `
        DELETE FROM planilla_control
        WHERE id = ?
      `,
      [id]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  private preparePayload(payload: PlanillaControlPayload): Partial<Record<PlanillaControlColumn, any>> {
    const prepared: Partial<Record<PlanillaControlColumn, any>> = {};

    for (const column of PLANILLA_CONTROL_COLUMNS) {
      if (!(column in payload)) {
        continue;
      }

      const value = payload[column];

      if (value === undefined) {
        continue;
      }

      prepared[column] = this.normalizeValue(value);
    }

    return prepared;
  }

  private normalizeValue(value: unknown): any {
    if (value === null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    return JSON.stringify(value);
  }
}
