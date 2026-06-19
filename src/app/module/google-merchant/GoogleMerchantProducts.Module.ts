import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleMerchantProductsController } from 'src/app/controller/google-merchant/GoogleMerchantProducts.Controller';
import { SQLGoogleMerchantProductsRepository } from 'src/app/driver/repositories/google-merchant/SQLGoogleMerchantProductsRepository';
import { GoogleMerchantProductsService } from 'src/app/services/google-merchant/GoogleMerchantProductsService';

@Module({
  imports: [TypeOrmModule.forFeature([], 'taxes')],
  controllers: [GoogleMerchantProductsController],
  providers: [
    GoogleMerchantProductsService,
    {
      provide: 'IGoogleMerchantProductsRepository',
      useClass: SQLGoogleMerchantProductsRepository
    }
  ]
})
export class GoogleMerchantProductsModule {}
