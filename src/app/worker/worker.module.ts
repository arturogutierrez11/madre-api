import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../module/Cache.module';
import { AutomeliSyncCronService } from './AutomeliSyncCron.service';
import { SyncHashService } from './SyncHashService';
import { SQLProductMadreRepository } from '../driver/repositories/madre/products/SQLProductMadreRepository';
import { AutomeliProductsRepository } from 'src/core/drivers/repositories/automeli/products/AutomeliProductsRepository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false,
      autoLoadEntities: false
    })
  ],
  providers: [
    AutomeliSyncCronService,
    SyncHashService,
    AutomeliProductsRepository,
    {
      provide: 'IProductsRepository',
      useClass: SQLProductMadreRepository
    }
  ]
})
export class WorkerModule {}

