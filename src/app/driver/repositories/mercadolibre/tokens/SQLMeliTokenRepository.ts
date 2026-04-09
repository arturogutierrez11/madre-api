import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ISQLMeliTokenRepository } from 'src/core/adapters/repositories/mercadolibre/tokens/ISQLMeliTokenRepository';
import { MeliTokenRow } from 'src/core/entities/mercadolibre/tokens/MeliTokenRow';
import { MeliTokenDTO } from 'src/core/entities/mercadolibre/tokens/dto/MeliTokenDTO';

@Injectable()
export class SQLMeliTokenRepository implements ISQLMeliTokenRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  /**
   * Devuelve el último token guardado (single-token storage)
   */
  async getToken(appKey: string): Promise<MeliTokenRow | null> {
    const result = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_tokens
      WHERE app_key = ?
      ORDER BY id DESC
      LIMIT 1
    `,
      [appKey]
    );

    return result.length ? result[0] : null;
  }

  /**
   * Inserta un nuevo token
   */
  async saveToken(data: MeliTokenDTO): Promise<void> {
    await this.entityManager.query(
      `
      INSERT INTO mercadolibre_tokens (
        app_key,
        client_id,
        access_token,
        refresh_token,
        expires_in,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [data.app_key, data.client_id, data.access_token, data.refresh_token, data.expires_in, data.expires_at]
    );
  }

  /**
   * PISA el último token existente
   */
  async updateLastToken(data: MeliTokenDTO): Promise<void> {
    const token = await this.getToken(data.app_key ?? 'default');

    if (!token) {
      throw new Error('[SQLMeliTokenRepository] No token found to update');
    }

    await this.entityManager.query(
      `
      UPDATE mercadolibre_tokens
      SET
        app_key = ?,
        client_id = ?,
        access_token = ?,
        refresh_token = ?,
        expires_in = ?,
        expires_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [data.app_key, data.client_id, data.access_token, data.refresh_token, data.expires_in, data.expires_at, token.id]
    );
  }
}
