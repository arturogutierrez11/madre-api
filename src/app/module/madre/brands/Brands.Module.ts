import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsMadreController } from 'src/app/controller/madre/brands/BrandsMadre.Controller';
import { BrandMatchController } from 'src/app/controller/madre/brands/match/BrandMatch.Controller';
import { SQLBrandsMegatoneRepository } from 'src/app/driver/repositories/madre/brands/match/SQLBrandsMegatoneRepository';
import { SQLBrandsOncityRepository } from 'src/app/driver/repositories/madre/brands/match/SQLCategoryOncityRepository';
import { SQLBrandsRepository } from 'src/app/driver/repositories/madre/brands/SQLBrandsRepository';
import { BrandMadreService } from 'src/app/services/madre/brands/BrandMadreService';
import { BrandMatchService } from 'src/app/services/madre/brands/match/BrandMatchService';

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
  controllers: [BrandsMadreController, BrandMatchController],
  providers: [
    BrandMadreService,
    BrandMatchService,

    {
      provide: 'IBrandsMadreRepository',
      useClass: SQLBrandsRepository
    },
    {
      provide: 'BrandsOncityRepository',
      useClass: SQLBrandsOncityRepository
    },
    {
      provide: 'BrandsMegatoneRepository',
      useClass: SQLBrandsMegatoneRepository
    }
  ]
})
export class BrandsModule {}
