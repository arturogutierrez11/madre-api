import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateUserData, IUserRepository } from 'src/core/adapters/repositories/auth/IUserRepository';
import { User } from 'src/core/entities/auth/User';

@Injectable()
export class SQLUserRepository implements IUserRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(data: CreateUserData): Promise<User> {
    await this.entityManager.query(
      `
      INSERT INTO auth_users (
        id,
        email,
        password_hash,
        name,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at
      ) VALUES (UUID(), ?, ?, ?, ?, ?, NULL, NOW(), NOW())
      `,
      [data.email, data.passwordHash, data.name, data.role, data.isActive ? 1 : 0]
    );

    const result = await this.entityManager.query(
      `
      SELECT
        id,
        email,
        password_hash,
        name,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at
      FROM auth_users
      WHERE email = ?
      LIMIT 1
      `,
      [data.email]
    );

    return this.mapRowToUser(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.entityManager.query(
      `
      SELECT
        id,
        email,
        password_hash,
        name,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at
      FROM auth_users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    return result.length ? this.mapRowToUser(result[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.entityManager.query(
      `
      SELECT
        id,
        email,
        password_hash,
        name,
        role,
        is_active,
        last_login_at,
        created_at,
        updated_at
      FROM auth_users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return result.length ? this.mapRowToUser(result[0]) : null;
  }

  async updateLastLoginAt(id: string, lastLoginAt: Date): Promise<boolean> {
    const result = await this.entityManager.query(
      `
      UPDATE auth_users
      SET
        last_login_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [lastLoginAt, id]
    );

    return Number(result.affectedRows ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.entityManager.query(
      `
      SELECT id
      FROM auth_users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return result.length > 0;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      role: row.role,
      isActive: Boolean(row.is_active),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
