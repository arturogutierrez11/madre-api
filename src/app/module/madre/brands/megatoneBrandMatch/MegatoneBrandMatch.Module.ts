import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MegatoneBrandMatchController } from 'src/app/controller/madre/brands/match/megatoneBrandsMatch/MegatoneBrandMatch.Controller';
import { SQLMegatoneBrandMatchRepository } from 'src/app/driver/repositories/madre/brands/match/megatoneBrandsMatch/SQLMegatoneBrandMatchRepository';
import { SaveMegatoneBrandMatchService } from 'src/app/services/madre/brands/match/megatoneBrandsMatch/megatoneBrandsMatch';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [MegatoneBrandMatchController],
  providers: [
    SaveMegatoneBrandMatchService,
    {
      provide: 'ISQLMegatoneBrandMatchRepository',
      useClass: SQLMegatoneBrandMatchRepository
    }
  ],
  exports: [SaveMegatoneBrandMatchService]
})
export class MegatoneBrandMatchModule {}
