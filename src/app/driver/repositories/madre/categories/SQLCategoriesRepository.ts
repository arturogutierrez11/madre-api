import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Categories } from 'src/core/entities/categories/madre/Categories';
import { ICategoriesMadreBDRepository } from '../../../../../../core/adapters/repositories/categories/madredb/ICategoriesMadreBDRepository';

@Injectable()
export class SQLCategoriesMadreRepository implements ICategoriesMadreBDRepository {
  private readonly logger = new Logger(SQLCategoriesMadreRepository.name);

  constructor(
    @InjectEntityManager()
    private readonly productosMadreEntityManager: EntityManager
  ) {}

  async findAlCategoriesInProductsMadre(offset: number, limit: number): Promise<Categories> {
    try {
      const categorias: Categories = await this.productosMadreEntityManager.query(
        `
      SELECT DISTINCT categoria 
      FROM defaultdb.productos_madre 
      WHERE categoria IS NOT NULL 
        AND categoria <> '' 
      ORDER BY categoria
      LIMIT ? OFFSET ?;
      `,
        [limit, offset]
      );

      return categorias;
    } catch (error) {
      this.logger.error(`Database query failed while fetching categories`, error.stack);
      throw new Error('Database error fetching categories');
    }
  }

  async countMadreCategories() {
    const result = await this.productosMadreEntityManager.query(
      `SELECT COUNT(DISTINCT categoria) AS total
     FROM defaultdb.productos_madre
     WHERE categoria IS NOT NULL AND categoria <> '';`
    );

    return result[0].total;
  }
}
