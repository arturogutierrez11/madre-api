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

  async findAll(): Promise<any[]> {
    const query = `
    SELECT *
    FROM publication_runs
    ORDER BY created_at DESC, id DESC
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query);

    return rows.map(row => ({
      ...row,
      marketplaces: this.parseJsonOrCsv(row.marketplaces),
      metadata: this.parseJsonOrNull(row.metadata)
    }));
  }

  async findById(id: number): Promise<PublicationRun | null> {
    const query = `
    SELECT
      pr.id,
      pr.status,
      pr.marketplaces,
      pr.total_jobs,
      pr.success_jobs,
      pr.failed_jobs,
      pr.created_at,
      pr.started_at,
      pr.finished_at,
      pr.metadata,
      COALESCE(stats.pending_jobs, 0) AS pending_jobs,
      COALESCE(stats.processing_jobs, 0) AS processing_jobs,
      COALESCE(stats.success_jobs, 0) AS actual_success_jobs,
      COALESCE(stats.failed_jobs, 0) AS actual_failed_jobs,
      COALESCE(stats.skipped_jobs, 0) AS skipped_jobs,
      COALESCE(stats.cancelled_jobs, 0) AS cancelled_jobs,
      COALESCE(stats.retry_jobs, 0) AS retry_jobs
    FROM publication_runs
    pr
    LEFT JOIN (
      SELECT
        run_id,
        COUNT(*) AS total_jobs,
        SUM(status = 'pending') AS pending_jobs,
        SUM(status = 'processing') AS processing_jobs,
        SUM(status = 'success') AS success_jobs,
        SUM(status = 'failed') AS failed_jobs,
        SUM(status = 'skipped') AS skipped_jobs,
        SUM(status = 'cancelled') AS cancelled_jobs,
        SUM(status = 'retry') AS retry_jobs
      FROM publication_jobs
      WHERE run_id = ?
      GROUP BY run_id
    ) stats ON stats.run_id = pr.id
    WHERE pr.id = ?
    LIMIT 1
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [id, id]);

    if (!rows.length) return null;

    const row = rows[0];

    return {
      ...row,
      total_jobs: Number(row.total_jobs ?? 0),
      pending_jobs: Number(row.pending_jobs ?? 0),
      processing_jobs: Number(row.processing_jobs ?? 0),
      success_jobs: Number(row.actual_success_jobs ?? row.success_jobs ?? 0),
      failed_jobs: Number(row.actual_failed_jobs ?? row.failed_jobs ?? 0),
      skipped_jobs: Number(row.skipped_jobs ?? 0),
      cancelled_jobs: Number(row.cancelled_jobs ?? 0),
      retry_jobs: Number(row.retry_jobs ?? 0),
      metadata: this.parseJsonOrNull(row.metadata),
      marketplaces: this.parseJsonOrCsv(row.marketplaces)
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

  private parseJsonOrCsv(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value.split(',');
    }
  }

  private parseJsonOrNull(value: unknown): unknown {
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
}
