import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  ISQLTaxesCategoriesRepository,
  TaxesCategoryRow
} from 'src/core/adapters/repositories/taxes/ISQLTaxesCategoriesRepository';
import { EntityManager } from 'typeorm';

@Injectable()
export class SQLTaxesCategoriesRepository implements ISQLTaxesCategoriesRepository {
  constructor(
    @InjectEntityManager('taxes')
    private readonly entityManager: EntityManager
  ) {}

  async findByMla(idMla: string): Promise<TaxesCategoryRow | null> {
    const normalizedIdMla = this.normalizeIdMla(idMla);

    if (!normalizedIdMla) {
      return null;
    }

    const rows = await this.entityManager.query(
      `
        SELECT
          id,
          id_mla,
          categoria_arancelaria,
          die,
          te,
          iva,
          derechos,
          composicion_conf_automeli_iva,
          composicion_conf_automeli_imp2,
          composicion_conf_automeli_imp3,
          compuesto,
          codigo_categoria_automeli
        FROM ml_categories
        WHERE id_mla = ?
        LIMIT 1
      `,
      [normalizedIdMla]
    );

    if (!rows.length) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async findManyByMla(idMlas: string[]): Promise<TaxesCategoryRow[]> {
    const normalizedIds = [
      ...new Set((idMlas ?? []).map(id => this.normalizeIdMla(id)).filter(Boolean))
    ];

    if (!normalizedIds.length) {
      return [];
    }

    const placeholders = normalizedIds.map(() => '?').join(', ');

    const rows = await this.entityManager.query(
      `
        SELECT
          id,
          id_mla,
          categoria_arancelaria,
          die,
          te,
          iva,
          derechos,
          composicion_conf_automeli_iva,
          composicion_conf_automeli_imp2,
          composicion_conf_automeli_imp3,
          compuesto,
          codigo_categoria_automeli
        FROM ml_categories
        WHERE id_mla IN (${placeholders})
      `,
      normalizedIds
    );

    return rows.map((row: any) => this.mapRow(row));
  }

  private normalizeIdMla(idMla: string): string {
    return String(idMla ?? '').trim().toUpperCase();
  }

  private mapRow(row: any): TaxesCategoryRow {
    return {
      id: Number(row.id),
      id_mla: String(row.id_mla),
      categoria_arancelaria: row.categoria_arancelaria ?? null,
      die: row.die != null ? Number(row.die) : null,
      te: row.te != null ? Number(row.te) : null,
      iva: row.iva != null ? Number(row.iva) : null,
      derechos: row.derechos != null ? Number(row.derechos) : null,
      composicion_conf_automeli_iva:
        row.composicion_conf_automeli_iva != null
          ? Number(row.composicion_conf_automeli_iva)
          : null,
      composicion_conf_automeli_imp2:
        row.composicion_conf_automeli_imp2 != null
          ? Number(row.composicion_conf_automeli_imp2)
          : null,
      composicion_conf_automeli_imp3:
        row.composicion_conf_automeli_imp3 != null
          ? Number(row.composicion_conf_automeli_imp3)
          : null,
      compuesto: row.compuesto != null ? Number(row.compuesto) : null,
      codigo_categoria_automeli: row.codigo_categoria_automeli ?? null
    };
  }
}
