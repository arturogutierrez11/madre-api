import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import {
  AutomeliBulkUpdateData,
  MeliProductImportData,
  IProductsRepository,
  ProductStatusSnapshot
} from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { ProductImage, ProductMadre } from 'src/core/entities/madre/products/ProductMadre';

const BULK_UPDATE_BATCH_SIZE = 500;

@Injectable()
export class SQLProductMadreRepository implements IProductsRepository {
  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  private parseImages(row: any): ProductImage[] {
    const images: ProductImage[] = [];

    for (let i = 1; i <= 10; i++) {
      const url = row[`imagen_${i}`];
      if (url) images.push({ position: i, url });
    }

    return images;
  }

  private parseAttributes(raw: any): ProductMadre['attributes'] {
    if (!raw) return { raw: {} };

    return {
      brand: raw.marca ?? null,
      color: raw.color ?? null,
      model: raw.modelo ?? null,
      material: raw.material ?? null,
      size: raw.talle ?? null,
      raw
    };
  }

  private mapRowToProduct(row: any): ProductMadre {
    return {
      id: row.id,
      sku: row.sku,
      title: row.titulo,
      description: row.descripcion,
      categoryPath: row.categoria,
      price: Number(row.precio),
      stock: Number(row.stock),
      status: row.estado,
      images: this.parseImages(row),
      videoUrl: row.video_1 ?? undefined,
      attributes: this.parseAttributes(row.atributos),
      shippingTime: row.tiempo_envio ? Number(row.tiempo_envio) : undefined,
      meliStatus: row.meli_status ?? null,
      amzStatus: row.amz_status ?? null,
      categoryMLA: row.categoria_mla ?? null,
      categoryId: row.categoria_mla,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async findAll(
    { limit, offset }: PaginationParams,
    filters?: { sku?: string }
  ): Promise<PaginatedResult<ProductMadre>> {
    const whereClause = filters?.sku ? 'WHERE sku LIKE ?' : '';

    const params: any[] = [];
    if (filters?.sku) {
      params.push(`%${filters.sku}%`);
    }
    params.push(limit, offset);

    const rows = await this.productosMadreEntityManager.query(
      `
    SELECT *
    FROM productos_madre
    ${whereClause}
    ORDER BY id ASC
    LIMIT ? OFFSET ?
    `,
      params
    );

    const countParams: any[] = [];
    if (filters?.sku) {
      countParams.push(`%${filters.sku}%`);
    }

    const countResult = await this.productosMadreEntityManager.query(
      `
    SELECT COUNT(*) AS total
    FROM productos_madre
    ${whereClause}
    `,
      countParams
    );

    const total = Number(countResult[0].total);
    const hasNext = offset + limit < total;

    return {
      items: rows.map(row => this.mapRowToProduct(row)),
      total,
      limit,
      offset,
      count: rows.length,
      hasNext,
      nextOffset: hasNext ? offset + limit : null
    };
  }

  async findStatusSnapshotsBySkus(skus: string[]): Promise<ProductStatusSnapshot[]> {
    const normalizedSkus = [...new Set(
      (skus ?? [])
        .map(sku => String(sku ?? '').trim().toUpperCase())
        .filter(Boolean)
    )];

    if (!normalizedSkus.length) {
      return [];
    }

    const placeholders = normalizedSkus.map(() => '?').join(', ');

    const rows = await this.productosMadreEntityManager.query(
      `
        SELECT
          sku,
          precio AS price,
          stock,
          estado AS status
        FROM productos_madre
        WHERE sku IN (${placeholders})
      `,
      normalizedSkus
    );

    const rowMap = new Map<string, ProductStatusSnapshot>(
      rows.map((row: any) => [
        String(row.sku).trim().toUpperCase(),
        {
          sku: String(row.sku).trim().toUpperCase(),
          price: Number(row.price ?? 0),
          stock: Number(row.stock ?? 0),
          status: row.status ?? null
        }
      ])
    );

    return normalizedSkus.map(sku => rowMap.get(sku) ?? {
      sku,
      price: 0,
      stock: 0,
      status: null
    });
  }

  async bulkUpdateFromAutomeli(products: AutomeliBulkUpdateData[]): Promise<number> {
    if (products.length === 0) {
      return 0;
    }

    let totalAffected = 0;

    for (let i = 0; i < products.length; i += BULK_UPDATE_BATCH_SIZE) {
      const batch = products.slice(i, i + BULK_UPDATE_BATCH_SIZE);
      const affected = await this.executeBulkUpdate(batch);
      totalAffected += affected;
    }

    return totalAffected;
  }

  private escapeSku(sku: string): string {
    return sku.replace(/'/g, "''");
  }

  async bulkUpsertFromMeliProducts(products: MeliProductImportData[]): Promise<number> {
    if (products.length === 0) return 0;

    let totalAffected = 0;

    for (let i = 0; i < products.length; i += BULK_UPDATE_BATCH_SIZE) {
      const batch = products.slice(i, i + BULK_UPDATE_BATCH_SIZE);
      totalAffected += await this.executeBulkUpsertFromMeli(batch);
    }

    return totalAffected;
  }

  private async executeBulkUpsertFromMeli(products: MeliProductImportData[]): Promise<number> {
    if (products.length === 0) return 0;

    const placeholders = products
      .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .join(',');

    const values: any[] = [];

    for (const p of products) {
      const imagesByPosition: (string | null)[] = new Array(10).fill(null);
      for (const img of p.images) {
        if (img.position >= 1 && img.position <= 10) {
          imagesByPosition[img.position - 1] = img.url;
        }
      }

      const attributesJson =
        p.attributes != null ? JSON.stringify(p.attributes.raw) : null;

      values.push(
        p.sku,
        p.title,
        p.description,
        p.categoryPath,
        p.price,
        p.stock,
        p.status,
        ...imagesByPosition,
        p.categoryMLA ?? null,
        attributesJson
      );
    }

    const sql = `
      INSERT INTO productos_madre (
        sku, titulo, descripcion, categoria, precio, stock, estado,
        imagen_1, imagen_2, imagen_3, imagen_4, imagen_5,
        imagen_6, imagen_7, imagen_8, imagen_9, imagen_10,
        categoria_mla, atributos
      )
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        descripcion = VALUES(descripcion),
        categoria = VALUES(categoria),
        precio = VALUES(precio),
        stock = VALUES(stock),
        estado = VALUES(estado),
        imagen_1 = VALUES(imagen_1),
        imagen_2 = VALUES(imagen_2),
        imagen_3 = VALUES(imagen_3),
        imagen_4 = VALUES(imagen_4),
        imagen_5 = VALUES(imagen_5),
        imagen_6 = VALUES(imagen_6),
        imagen_7 = VALUES(imagen_7),
        imagen_8 = VALUES(imagen_8),
        imagen_9 = VALUES(imagen_9),
        imagen_10 = VALUES(imagen_10),
        categoria_mla = VALUES(categoria_mla),
        atributos = VALUES(atributos),
        updated_at = NOW()
    `;

    const result = await this.productosMadreEntityManager.query(sql, values);
    return result.affectedRows || 0;
  }

  private async executeBulkUpdate(products: AutomeliBulkUpdateData[]): Promise<number> {
    if (products.length === 0) {
      return 0;
    }

    const skus = products.map(p => `'${this.escapeSku(p.sku)}'`).join(',');

    const precioCases = products.map(p => `WHEN '${this.escapeSku(p.sku)}' THEN ${p.price}`).join(' ');

    const stockCases = products.map(p => `WHEN '${this.escapeSku(p.sku)}' THEN ${p.stock}`).join(' ');

    const estadoCases = products.map(p => `WHEN '${this.escapeSku(p.sku)}' THEN '${p.status}'`).join(' ');

    const tiempoEnvioCases = products
      .map(p => `WHEN '${this.escapeSku(p.sku)}' THEN ${p.shippingTime ?? 'NULL'}`)
      .join(' ');

    const meliStatusCases = products
      .map(p => `WHEN '${this.escapeSku(p.sku)}' THEN '${p.meliStatus}'`)
      .join(' ');

    const amzStatusCases = products
      .map(p => `WHEN '${this.escapeSku(p.sku)}' THEN ${p.amzStatus != null ? `'${p.amzStatus}'` : 'NULL'}`)
      .join(' ');

    const sql = `
    UPDATE productos_madre
    SET
      precio = CASE sku ${precioCases} ELSE precio END,
      stock = CASE sku ${stockCases} ELSE stock END,
      estado = CASE sku ${estadoCases} ELSE estado END,
      tiempo_envio = CASE sku ${tiempoEnvioCases} ELSE tiempo_envio END,
      meli_status = CASE sku ${meliStatusCases} ELSE meli_status END,
      amz_status = CASE sku ${amzStatusCases} ELSE amz_status END,
      updated_at = CASE
        WHEN
          precio <> CASE sku ${precioCases} ELSE precio END
          OR stock <> CASE sku ${stockCases} ELSE stock END
          OR estado <> CASE sku ${estadoCases} ELSE estado END
          OR (
            tiempo_envio <> CASE sku ${tiempoEnvioCases} ELSE tiempo_envio END
            OR (tiempo_envio IS NULL AND CASE sku ${tiempoEnvioCases} ELSE tiempo_envio END IS NOT NULL)
            OR (tiempo_envio IS NOT NULL AND CASE sku ${tiempoEnvioCases} ELSE tiempo_envio END IS NULL)
          )
          OR (
            meli_status <> CASE sku ${meliStatusCases} ELSE meli_status END
            OR (meli_status IS NULL AND CASE sku ${meliStatusCases} ELSE meli_status END IS NOT NULL)
            OR (meli_status IS NOT NULL AND CASE sku ${meliStatusCases} ELSE meli_status END IS NULL)
          )
          OR (
            amz_status <> CASE sku ${amzStatusCases} ELSE amz_status END
            OR (amz_status IS NULL AND CASE sku ${amzStatusCases} ELSE amz_status END IS NOT NULL)
            OR (amz_status IS NOT NULL AND CASE sku ${amzStatusCases} ELSE amz_status END IS NULL)
          )
        THEN NOW()
        ELSE updated_at
      END
    WHERE sku IN (${skus})
  `;

    const result = await this.productosMadreEntityManager.query(sql);
    return result.affectedRows || 0;
  }
}
