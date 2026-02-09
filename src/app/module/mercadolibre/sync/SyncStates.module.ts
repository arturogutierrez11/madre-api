import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncStatesController } from 'src/app/controller/mercadolibre/sync/SyncStates.Controller';
import { SQLSyncStatesRepository } from 'src/app/driver/repositories/mercadolibre/sync/SQLSyncStatesRepository';
import { SyncStatesService } from 'src/app/services/mercadolibre/sync/SyncStatesService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SyncStatesController],
  providers: [
    {
      provide: 'ISyncStatesRepository',
      useClass: SQLSyncStatesRepository
    },
    SyncStatesService
  ],
  exports: [SyncStatesService]
})
export class SyncStatesModule {}
