import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  GoogleMerchantProductRow,
  IGoogleMerchantProductsRepository
} from 'src/core/adapters/repositories/google-merchant/IGoogleMerchantProductsRepository';

@Injectable()
export class SQLGoogleMerchantProductsRepository implements IGoogleMerchantProductsRepository {
  constructor(
    @InjectEntityManager('taxes')
    private readonly entityManager: EntityManager
  ) {}

  async findActiveProducts(limit: number, offset: number): Promise<GoogleMerchantProductRow[]> {
    const safeLimit = Math.min(500, Math.max(1, Math.trunc(Number(limit) || 50)));
    const safeOffset = Math.max(0, Math.trunc(Number(offset) || 0));

    const rows = await this.entityManager.query(
      `
        SELECT *
        FROM tlq.products
        WHERE is_active = 1
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `,
      [safeLimit, safeOffset]
    );

    return rows.map((row: Record<string, any>) => this.mapRow(row));
  }

  async countActiveProducts(): Promise<number> {
    const rows = await this.entityManager.query(
      `
        SELECT COUNT(*) AS total
        FROM tlq.products
        WHERE is_active = 1
      `
    );

    return Number(rows[0]?.total ?? 0);
  }

  private mapRow(row: Record<string, any>): GoogleMerchantProductRow {
    const mapped: GoogleMerchantProductRow = {};

    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date) {
        mapped[key] = value.toISOString();
        continue;
      }

      mapped[key] = value ?? null;
    }

    return mapped;
  }
}
