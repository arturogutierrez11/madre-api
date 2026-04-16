import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IProductDeltaRepository } from 'src/core/adapters/repositories/madre/delta/IProductDeltaRepository';
import { ProductDelta } from 'src/core/entities/madre/delta/ProductDelta';

@Injectable()
export class SQLProductDeltaRepository implements IProductDeltaRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async findChangesAfterId(afterId: number, limit: number): Promise<ProductDelta[]> {
    const rows = await this.entityManager.query(
      `SELECT
        id,
        producto_id,
        sku,
        campo,
        valor_anterior,
        valor_nuevo,
        operacion,
        origen,
        lote_id,
        hash_idem,
        created_at
      FROM defaultdb.productos_madre_delta
      WHERE id > ?
      ORDER BY id ASC
      LIMIT ?`,
      [afterId, limit]
    );

    return rows.map((row: any) => this.mapRowToDelta(row));
  }

  private mapRowToDelta(row: any): ProductDelta {
    return {
      id: Number(row.id),
      productoId: row.producto_id,
      sku: row.sku,
      campo: row.campo,
      valorAnterior: row.valor_anterior ?? null,
      valorNuevo: row.valor_nuevo ?? null,
      operacion: row.operacion,
      origen: row.origen,
      loteId: row.lote_id ?? null,
      hashIdem: row.hash_idem ?? null,
      createdAt: new Date(row.created_at)
    };
  }
}
