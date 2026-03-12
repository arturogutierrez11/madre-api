import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationJobsController } from 'src/app/controller/madre/publisher/publication_Jobs/PublicationJobs.Controller';
import { PublicationRunsController } from 'src/app/controller/madre/publisher/publication_Run/PublicationRuns.Controller';
import { SQLPublicationJobsRepository } from 'src/app/driver/repositories/madre/publisher/publication_Jobs/SQLPublicationJobsRepository';
import { SQLPublicationRunRepository } from 'src/app/driver/repositories/madre/publisher/publication_Run/SQLPublicationRunRepository';
import { PublicationJobsServices } from 'src/app/services/madre/publisher/publication_Jobs/PublicationJobsServices';
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
  controllers: [PublicationJobsController],
  providers: [
    PublicationJobsServices,

    {
      provide: 'ISQLPublicationJobsRepository',
      useClass: SQLPublicationJobsRepository
    }
  ],
  exports: [PublicationJobsServices]
})
export class PublicationJobsModule {}
