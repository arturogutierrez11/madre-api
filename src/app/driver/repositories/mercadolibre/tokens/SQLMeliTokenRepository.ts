import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ISQLMeliTokenRepository } from 'src/core/adapters/repositories/mercadolibre/tokens/ISQLMeliTokenRepository';
import { MeliTokenRow } from 'src/core/entities/mercadolibre/tokens/MeliTokenRow';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLMeliTokenRepository implements ISQLMeliTokenRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  /**
   * Obtiene el último token guardado
   */
  async getToken(): Promise<MeliTokenRow | null> {
    const result = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_tokens
      ORDER BY id DESC
      LIMIT 1
      `
    );

    return result.length ? result[0] : null;
  }

  /**
   * Inserta un nuevo token
   */
  async saveToken(data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: Date;
  }): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO mercadolibre_tokens (
        access_token,
        refresh_token,
        expires_in,
        expires_at
      ) VALUES (?, ?, ?, ?)
      `,
      [data.access_token, data.refresh_token, data.expires_in, data.expires_at]
    );
  }

  /**
   * Actualiza el último token (si existe)
   */
  async updateLastToken(data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: Date;
  }): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

    await this.entityManager.query(
      `
      UPDATE mercadolibre_tokens
      SET
        access_token = ?,
        refresh_token = ?,
        expires_in = ?,
        expires_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [data.access_token, data.refresh_token, data.expires_in, data.expires_at, token.id]
    );
  }
}
