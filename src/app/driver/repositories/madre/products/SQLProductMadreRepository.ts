import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PaginationParams } from 'src/core/entities/common/Pagination';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { IProductsRepository } from 'src/core/adapters/repositories/madre/products/IProductsRepository';
import { ProductImage, ProductMadre } from 'src/core/entities/madre/products/ProductMadre';

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
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async findAll({ limit, offset }: PaginationParams): Promise<PaginatedResult<ProductMadre>> {
    const rows = await this.productosMadreEntityManager.query(
      `
    SELECT *
    FROM productos_madre
    ORDER BY id ASC
    
    `,
      [offset]
    );

    const countResult = await this.productosMadreEntityManager.query(`
    SELECT COUNT(*) AS total FROM productos_madre
  `);

    const total = Number(countResult[0].total);

    return {
      items: rows.map(row => this.mapRowToProduct(row)),
      total,
      limit: 1,
      offset,
      count: rows.length,
      hasNext: false,
      nextOffset: null
    };
  }
}
