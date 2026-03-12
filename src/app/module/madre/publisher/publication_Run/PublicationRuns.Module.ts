import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationRunsController } from 'src/app/controller/madre/publisher/publication_Run/PublicationRuns.Controller';
import { SQLPublicationRunRepository } from 'src/app/driver/repositories/madre/publisher/publication_Run/SQLPublicationRunRepository';
import { PublicationRunService } from 'src/app/services/madre/publisher/publication_run/PublicationRunService';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
  controllers: [PublicationRunsController],
  providers: [
    PublicationRunService,

    {
      provide: 'IPublicationRunRepository',
      useClass: SQLPublicationRunRepository
    }
  ],
  exports: [PublicationRunService]
})
export class PublicationRunsModule {}
