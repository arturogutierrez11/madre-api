import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UpdatePublicationJobDTO } from 'src/app/controller/madre/publisher/publication_Jobs/dto/UpdatePublicationJobDTO';
import { ISQLPublicationJobsRepository } from 'src/core/adapters/repositories/madre/publisher/publication_Jobs/ISQLPublicationJobsRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLPublicationJobsRepository implements ISQLPublicationJobsRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async createMany(runId: number, jobs: { sku: string; marketplace: string }[]): Promise<number> {
    if (!jobs || jobs.length === 0) {
      return 0;
    }

    const values = jobs.map(() => `(?, ?, ?, 'pending', 0)`).join(',');

    const query = `
    INSERT INTO publication_jobs
    (run_id, sku, marketplace, status, attempts)
    VALUES ${values}
  `;

    const params = jobs.flatMap(job => [runId, job.sku, job.marketplace]);

    const result: any = await this.productosMadreEntityManager.query(query, params);

    return result.affectedRows;
  }

  //- consulte los jobs pendientes de publicación.

  async findPending(limit: number): Promise<any[]> {
    const query = `
  SELECT id, run_id, sku, status, marketplace, attempts, locked_at
  FROM publication_jobs
  WHERE status = 'pending'
  ORDER BY id ASC
  LIMIT ?
`;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [limit]);

    return rows;
  }

  //worker actualice el estado del job.

  async updateJob(id: number, data: UpdatePublicationJobDTO): Promise<void> {
    const query = `
    UPDATE publication_jobs
    SET 
      status = ?,
      result = ?,
      error_message = ?,
      request_payload = ?,
      response_payload = ?,
      marketplace_item_id = ?,
      locked_at = NULL,
      updated_at = NOW()
    WHERE id = ?
  `;

    await this.productosMadreEntityManager.query(query, [
      data.status,
      data.result ? JSON.stringify(data.result) : null,
      data.error_message || null,
      data.request_payload ? JSON.stringify(data.request_payload) : null,
      data.response_payload ? JSON.stringify(data.response_payload) : null,
      data.marketplace_item_id || null,
      id
    ]);
  }

  async claimJobs(limit: number): Promise<any[]> {
    return this.productosMadreEntityManager.transaction(async manager => {
      const jobs: any[] = await manager.query(
        `
      SELECT id, run_id, sku, marketplace
      FROM publication_jobs
      WHERE status = 'pending'
      ORDER BY id ASC
      LIMIT ?
      FOR UPDATE SKIP LOCKED
      `,
        [limit]
      );

      if (!jobs.length) {
        return [];
      }

      const ids = jobs.map(j => j.id);

      await manager.query(
        `
      UPDATE publication_jobs
      SET 
        status = 'processing',
        locked_at = NOW(),
        updated_at = NOW()
      WHERE id IN (${ids.map(() => '?').join(',')})
      `,
        ids
      );

      return jobs.map(job => ({
        ...job,
        status: 'processing'
      }));
    });
  }

  async getRunProgress(runId: number): Promise<any> {
    const query = `
    SELECT
      run_id,
      COUNT(*) AS total,
      SUM(status = 'pending') AS pending,
      SUM(status = 'processing') AS processing,
      SUM(status = 'success') AS success,
      SUM(status = 'failed') AS failed,
      SUM(status = 'skipped') AS skipped,
      SUM(status = 'cancelled') AS cancelled,
      SUM(status = 'retry') AS retry
    FROM publication_jobs
    WHERE run_id = ?
    GROUP BY run_id
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [runId]);

    if (!rows.length) {
      return {
        run_id: runId,
        total: 0,
        pending: 0,
        processing: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        cancelled: 0,
        retry: 0
      };
    }

    return rows[0];
  }

  async getJobsByRun(
    runId: number,
    limit: number,
    offset: number,
    status?: string
  ): Promise<{
    items: any[];
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    nextOffset: number | null;
  }> {
    let query = `
    SELECT
      id,
      run_id,
      sku,
      marketplace,
      status,
      attempts,
      result,
      error_message,
      request_payload,
      response_payload,
      marketplace_item_id,
      locked_at,
      created_at,
      updated_at
    FROM publication_jobs
    WHERE run_id = ?
  `;

    const params: any[] = [runId];
    let countQuery = `
    SELECT COUNT(*) AS total
    FROM publication_jobs
    WHERE run_id = ?
  `;
    const countParams: any[] = [runId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    query += `
    ORDER BY id ASC
    LIMIT ?
    OFFSET ?
  `;

    params.push(limit, offset);

    const [rows, totalRows]: [any[], any[]] = await Promise.all([
      this.productosMadreEntityManager.query(query, params),
      this.productosMadreEntityManager.query(countQuery, countParams)
    ]);

    const total = Number(totalRows[0]?.total ?? 0);

    return {
      items: rows.map(row => ({
        ...row,
        attempts: Number(row.attempts ?? 0),
        result: this.parseJsonField(row.result),
        request_payload: this.parseJsonField(row.request_payload),
        response_payload: this.parseJsonField(row.response_payload)
      })),
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      nextOffset: offset + limit < total ? offset + limit : null
    };
  }

  async retryFailedJobs(runId: number): Promise<number> {
    const query = `
    UPDATE publication_jobs
    SET
      status = 'pending',
      attempts = attempts + 1,
      updated_at = NOW()
    WHERE run_id = ?
    AND status = 'failed'
  `;

    const result: any = await this.productosMadreEntityManager.query(query, [runId]);

    return result.affectedRows;
  }

  async incrementRunCounter(runId: number, field: 'success_jobs' | 'failed_jobs'): Promise<void> {
    const query = `
    UPDATE publication_runs
    SET ${field} = ${field} + 1
    WHERE id = ?
  `;

    await this.productosMadreEntityManager.query(query, [runId]);
  }
  async findRunIdByJobId(jobId: number): Promise<number | null> {
    const query = `
    SELECT run_id
    FROM publication_jobs
    WHERE id = ?
    LIMIT 1
  `;

    const rows: any[] = await this.productosMadreEntityManager.query(query, [jobId]);

    if (!rows.length) return null;

    return rows[0].run_id;
  }

  async incrementTotalJobs(runId: number, count: number): Promise<void> {
    const query = `
    UPDATE publication_runs
    SET total_jobs = total_jobs + ?
    WHERE id = ?
  `;

    await this.productosMadreEntityManager.query(query, [count, runId]);
  }

  private parseJsonField(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value ?? null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
