import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandMatchController } from 'src/app/controller/madre/brands/match/fravegaBrandsMatch/BrandMatch.Controller';
import { SQLBrandMatchRepository } from 'src/app/driver/repositories/madre/brands/match/fravegaBrandsMatch/SQLBrandMatchRepository';
import { SaveBrandMatchService } from 'src/app/services/madre/brands/match/fravegaBrandsMatch/SaveBrandMatchService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [BrandMatchController],
  providers: [
    SaveBrandMatchService,
    {
      provide: 'BrandMatchRepository',
      useClass: SQLBrandMatchRepository
    }
  ],
  exports: [SaveBrandMatchService]
})
export class BrandMatchModule {}
