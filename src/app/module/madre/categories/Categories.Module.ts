import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { CategoryMadreController } from 'src/app/controller/madre/categories/CategoryMadre.Controller';

// Services
import { CategoryMadreService } from 'src/app/services/madre/categories/CategoryMadreService';
import { TreeCategoriesFravegaService } from 'src/app/services/madre/categories/match/fravegaCategoriesProcess/TreeCategoriesFravegaService';

// Repositories
import { SQLCategoriesRepository } from 'src/app/driver/repositories/madre/categories/SQLCategoriesRepository';
import { SQLCategoriesFravegaRepository } from 'src/app/driver/repositories/madre/categories/match/fravegacategories-process/SQLCategoriesFravegaRepository';
import { SQLCategoriesMegatoneRepository } from 'src/app/driver/repositories/madre/categories/match/megatonecategories-process/SQLCategoriesMegatoneRepository';
import { CategoriesFravegaController } from 'src/app/controller/madre/categories/match/CategoriesFravega.Controller';
import { CategoriesMegatoneController } from 'src/app/controller/madre/categories/match/CategoriesMegatone.Controller';
import { CategoriesMegatoneService } from 'src/app/services/madre/categories/match/megatoneCategoriesProcess/TreeCategoriesMegatoneService';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false
    })
  ],

  controllers: [CategoryMadreController, CategoriesFravegaController, CategoriesMegatoneController],

  providers: [
    // services
    CategoryMadreService,
    TreeCategoriesFravegaService,
    CategoriesMegatoneService,

    // repositories (tokens CORRECTOS)
    {
      provide: 'CategoriesMadreRepository',
      useClass: SQLCategoriesRepository
    },
    {
      provide: 'ISQLCategoriesFravegaRepository',
      useClass: SQLCategoriesFravegaRepository
    },
    {
      provide: 'ISQLCategoriesMegatoneRepository',
      useClass: SQLCategoriesMegatoneRepository
    }
  ]
})
export class CategoriesModule {}
