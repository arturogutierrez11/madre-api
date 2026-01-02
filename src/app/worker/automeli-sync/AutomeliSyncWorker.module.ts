import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomeliProductsRepository } from 'src/core/drivers/repositories/automeli/products/AutomeliProductsRepository';
import { AutomeliProductsStateRedisCache } from '../../driver/cache/redis/AutomeliProductsStateRedisCache';
import { RedisSyncLock } from '../../driver/locks/redis/RedisSyncLock';
import { SQLProductMadreRepository } from '../../driver/repositories/madre/products/SQLProductMadreRepository';
import { RedisClientModule } from '../../module/RedisClient.module';
import { AutomeliProductsStateService } from './AutomeliProductsState.service';
import { AutomeliSyncCronService } from './AutomeliSyncCron.service';
import { ProductStateHasher } from './ProductStateHasher';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    RedisClientModule,
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
    AutomeliProductsStateService,
    ProductStateHasher,

    {
      provide: 'IProductsRepository',
      useClass: SQLProductMadreRepository
    },
    {
      provide: 'IAutomeliProductsRepository',
      useClass: AutomeliProductsRepository
    },
    {
      provide: 'IAutomeliProductsStateCache',
      useClass: AutomeliProductsStateRedisCache
    },
    {
      provide: 'ISyncLock',
      useClass: RedisSyncLock
    }
  ]
})
export class AutomeliSyncWorkerModule {}
