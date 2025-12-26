import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryMadreController } from 'src/app/controller/madre/categories/CategoryMadre.Controller';
import { CategoryMatchController } from 'src/app/controller/madre/categories/match/CategoryMatch.Controller';
import { SQLCategoriesMegatoneRepository } from 'src/app/driver/repositories/madre/categories/match/SQLCategoriesMegatoneRepository';
import { SQLCategoriesOncityRepository } from 'src/app/driver/repositories/madre/categories/match/SQLCategoriesOncityRepository';
import { SQLCategoriesRepository } from 'src/app/driver/repositories/madre/categories/SQLCategoriesRepository';
import { CategoryMadreService } from 'src/app/services/madre/categories/CategoryMadreService';
import { CategoryMatchService } from 'src/app/services/madre/categories/match/CategoryMatchService';

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
  controllers: [CategoryMatchController, CategoryMadreController],
  providers: [
    CategoryMatchService,
    CategoryMadreService,

    {
      provide: 'CategoriesMadreRepository',
      useClass: SQLCategoriesRepository
    },
    {
      provide: 'CategoriesOncityRepository',
      useClass: SQLCategoriesOncityRepository
    },
    {
      provide: 'CategoriesMegatoneRepository',
      useClass: SQLCategoriesMegatoneRepository
    }
  ]
})
export class CategoriesModule {}
