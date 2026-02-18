import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { FlatCategory, MercadoLibreCategory } from 'src/core/entities/mercadolibre/categories/MercadoLibreCategory';

import { ISQLMercadoLibreCategoriesRepository } from 'src/core/adapters/repositories/mercadolibre/categories/ISQLMercadoLibreCategoriesRepository';

@Injectable()
export class SQLMercadoLibreCategoriesRepository implements ISQLMercadoLibreCategoriesRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  // ─────────────────────────────────────────────
  // UPSERT MANY
  // ─────────────────────────────────────────────
  async upsertMany(categories: FlatCategory[]): Promise<void> {
    if (!categories.length) return;

    const values = categories.map(() => `(?, ?, ?, ?, ?, ?)`).join(',');

    const params: any[] = [];

    for (const c of categories) {
      params.push(c.id, c.name, c.parentId, c.level, c.path, c.isLeaf ? 1 : 0);
    }

    await this.entityManager.query(
      `
      INSERT INTO mercadolibre_categories (
        id,
        name,
        parent_id,
        level,
        path,
        is_leaf
      )
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        parent_id = VALUES(parent_id),
        level = VALUES(level),
        path = VALUES(path),
        is_leaf = VALUES(is_leaf),
        updated_at = CURRENT_TIMESTAMP
      `,
      params
    );
  }

  // ─────────────────────────────────────────────
  // FIND BY ID
  // ─────────────────────────────────────────────
  async findById(id: string): Promise<MercadoLibreCategory | null> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_categories
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return null;

    return this.mapRow(rows[0]);
  }

  // ─────────────────────────────────────────────
  // FIND CHILDREN (direct children only)
  // ─────────────────────────────────────────────
  async findChildren(parentId: string | null): Promise<MercadoLibreCategory[]> {
    let rows;

    if (parentId === null) {
      rows = await this.entityManager.query(
        `
        SELECT *
        FROM mercadolibre_categories
        WHERE parent_id IS NULL
        ORDER BY name ASC
        `
      );
    } else {
      rows = await this.entityManager.query(
        `
        SELECT *
        FROM mercadolibre_categories
        WHERE parent_id = ?
        ORDER BY name ASC
        `,
        [parentId]
      );
    }

    return rows.map((r: any) => this.mapRow(r));
  }

  // ─────────────────────────────────────────────
  // FIND TREE (flat ordered by level + path)
  // ─────────────────────────────────────────────
  async findTree(): Promise<MercadoLibreCategory[]> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_categories
      ORDER BY level ASC, path ASC
      `
    );

    return rows.map((r: any) => this.mapRow(r));
  }

  // ─────────────────────────────────────────────
  // FIND SUBTREE
  // ─────────────────────────────────────────────
  async findSubTree(categoryId: string): Promise<MercadoLibreCategory[]> {
    const rows = await this.entityManager.query(
      `
      SELECT *
      FROM mercadolibre_categories
      WHERE path LIKE CONCAT(
        (SELECT path FROM mercadolibre_categories WHERE id = ?),
        '%'
      )
      ORDER BY level ASC, path ASC
      `,
      [categoryId]
    );

    return rows.map((r: any) => this.mapRow(r));
  }

  // ─────────────────────────────────────────────
  // MAP ROW
  // ─────────────────────────────────────────────
  private mapRow(row: any): MercadoLibreCategory {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      level: Number(row.level),
      path: row.path,
      isLeaf: Boolean(row.is_leaf),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
