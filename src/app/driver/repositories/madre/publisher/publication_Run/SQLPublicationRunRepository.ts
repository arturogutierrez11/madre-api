import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { IPublicationRunRepository } from 'src/core/adapters/repositories/madre/publisher/publication_Run/IPublicationRunRepository';

import {
  CreatePublicationRunDTO,
  PublicationRun
} from 'src/core/entities/madre/publisher/publication_Run/PublicationRun';

@Injectable()
export class SQLPublicationRunRepository implements IPublicationRunRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async create(data: CreatePublicationRunDTO): Promise<PublicationRun> {
    if (!data.marketplaces || !data.marketplaces.length) {
      throw new Error('marketplaces is required');
    }

    const query = `
    INSERT INTO publication_runs (marketplaces)
    VALUES (?)
  `;

    const result: any = await this.productosMadreEntityManager.query(query, [JSON.stringify(data.marketplaces)]);

    const id = result.insertId;

    const run = await this.findById(id);

    return run!;
  }

  async findById(id: number): Promise<PublicationRun | null> {
    const query = `
    SELECT *
    FROM publication_runs
    WHERE id = ?
    LIMIT 1
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [id]);

    if (!rows.length) return null;

    const row = rows[0];

    let marketplaces = row.marketplaces;

    if (typeof marketplaces === 'string') {
      try {
        marketplaces = JSON.parse(marketplaces);
      } catch {
        marketplaces = marketplaces.split(',');
      }
    }

    return {
      ...row,
      marketplaces
    };
  }

  async updateStatus(id: number, status: string): Promise<void> {
    const query = `
      UPDATE publication_runs
      SET status = ?
      WHERE id = ?
    `;

    await this.productosMadreEntityManager.query(query, [status, id]);
  }

  async findRunById(id: number): Promise<any | null> {
    const query = `
    SELECT
      id,
      status,
      marketplaces,
      total_jobs,
      success_jobs,
      failed_jobs,
      created_at,
      started_at,
      finished_at
    FROM publication_runs
    WHERE id = ?
    LIMIT 1
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [id]);

    if (!rows.length) return null;

    const row = rows[0];

    return {
      ...row,
      marketplaces: typeof row.marketplaces === 'string' ? JSON.parse(row.marketplaces) : row.marketplaces
    };
  }

  async cancelRun(runId: number): Promise<number> {
    const query = `
    UPDATE publication_jobs
    SET
      status = 'cancelled',
      updated_at = NOW()
    WHERE run_id = ?
    AND status = 'pending'
  `;

    const result: any = await this.productosMadreEntityManager.query(query, [runId]);

    return result.affectedRows;
  }

  async updateRunStatus(runId: number, status: string): Promise<void> {
    const query = `
    UPDATE publication_runs
    SET
      status = ?,
      finished_at = NOW()
    WHERE id = ?
  `;

    await this.productosMadreEntityManager.query(query, [status, runId]);
  }
}
