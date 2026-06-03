import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanillaControlController } from 'src/app/controller/planilladecontrol/PlanillaControl.Controller';
import { PlanillaControlReposiotries } from 'src/app/driver/repositories/planilladecontrol/PlanillaControlReposiotries';
import { PlanillaControlService } from 'src/app/services/planilladecontrol/PlanillaControl.Service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [PlanillaControlController],
  providers: [
    PlanillaControlService,
    {
      provide: 'IPlanillaControlRepository',
      useClass: PlanillaControlReposiotries
    }
  ],
  exports: [PlanillaControlService]
})
export class PlanillaControlModule {}
