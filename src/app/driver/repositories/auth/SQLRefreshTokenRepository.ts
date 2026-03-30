import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  CreateRefreshTokenData,
  IRefreshTokenRepository
} from 'src/core/adapters/repositories/auth/IRefreshTokenRepository';
import { RefreshToken } from 'src/core/entities/auth/RefreshToken';

@Injectable()
export class SQLRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    await this.entityManager.query(
      `
      INSERT INTO auth_refresh_tokens (
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        user_agent,
        ip,
        created_at,
        updated_at
      ) VALUES (UUID(), ?, ?, ?, NULL, ?, ?, NOW(), NOW())
      `,
      [data.userId, data.tokenHash, data.expiresAt, data.userAgent ?? null, data.ip ?? null]
    );

    const result = await this.entityManager.query(
      `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        user_agent,
        ip,
        created_at,
        updated_at
      FROM auth_refresh_tokens
      WHERE token_hash = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
      `,
      [data.tokenHash]
    );

    return this.mapRowToRefreshToken(result[0]);
  }

  async findValidByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const result = await this.entityManager.query(
      `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at,
        user_agent,
        ip,
        created_at,
        updated_at
      FROM auth_refresh_tokens
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC, id DESC
      LIMIT 1
      `,
      [tokenHash]
    );

    return result.length ? this.mapRowToRefreshToken(result[0]) : null;
  }

  async revokeByTokenHash(tokenHash: string, revokedAt: Date): Promise<boolean> {
    const result = await this.entityManager.query(
      `
      UPDATE auth_refresh_tokens
      SET
        revoked_at = ?,
        updated_at = NOW()
      WHERE token_hash = ?
        AND revoked_at IS NULL
      `,
      [revokedAt, tokenHash]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  private mapRowToRefreshToken(row: any): RefreshToken {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
      userAgent: row.user_agent ?? null,
      ip: row.ip ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
