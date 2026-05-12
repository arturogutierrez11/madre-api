import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomeliProductSnapshotsController } from 'src/app/controller/automeli/snapshots/AutomeliProductSnapshots.Controller';
import { SQLAutomeliProductSnapshotsRepository } from 'src/app/driver/repositories/automeli/snapshots/SQLAutomeliProductSnapshotsRepository';
import { AutomeliProductSnapshotsService } from 'src/app/services/automeli/snapshots/AutomeliProductSnapshotsService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [AutomeliProductSnapshotsController],
  providers: [
    AutomeliProductSnapshotsService,
    {
      provide: 'IAutomeliProductSnapshotsRepository',
      useClass: SQLAutomeliProductSnapshotsRepository
    }
  ],
  exports: [AutomeliProductSnapshotsService]
})
export class AutomeliProductSnapshotsModule {}
