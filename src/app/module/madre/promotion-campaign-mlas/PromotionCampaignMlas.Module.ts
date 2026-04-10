import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionCampaignMlasController } from 'src/app/controller/central-promos/PromotionCampaignMlas.Controller';
import { SQLPromotionCampaignMlaRepository } from 'src/app/driver/repositories/central-promos/SQLPromotionCampaignMlaRepository';
import { PromotionCampaignMlaService } from 'src/app/services/madre/promotion-campaign-mlas/PromotionCampaignMlaService';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  controllers: [PromotionCampaignMlasController],
  providers: [
    PromotionCampaignMlaService,
    {
      provide: 'IPromotionCampaignMlaRepository',
      useClass: SQLPromotionCampaignMlaRepository
    }
  ],
  exports: [PromotionCampaignMlaService]
})
export class PromotionCampaignMlasModule {}
