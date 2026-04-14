import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxesCategoriesController } from 'src/app/controller/taxes/TaxesCategories.Controller';
import { SQLTaxesCategoriesRepository } from 'src/app/driver/repositories/taxes/SQLTaxesCategoriesRepository';
import { TaxesCategoriesService } from 'src/app/services/taxes/TaxesCategoriesService';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      name: 'taxes',
      type: 'mysql',
      host: process.env.TAXES_DB_HOST ?? '146.190.131.71',
      port: Number(process.env.TAXES_DB_PORT ?? 3306),
      username: process.env.TAXES_DB_USERNAME ?? 'fjo24',
      password: process.env.TAXES_DB_PASSWORD ?? 'test',
      database: process.env.TAXES_DB_DATABASE ?? 'tlq',
      synchronize: false,
      autoLoadEntities: false
    }),
    TypeOrmModule.forFeature([], 'taxes')
  ],
  controllers: [TaxesCategoriesController],
  providers: [
    TaxesCategoriesService,
    {
      provide: 'ISQLTaxesCategoriesRepository',
      useClass: SQLTaxesCategoriesRepository
    }
  ],
  exports: [TaxesCategoriesService]
})
export class TaxesCategoriesModule {}
