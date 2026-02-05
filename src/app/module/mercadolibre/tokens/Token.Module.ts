import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from 'src/app/controller/mercadolibre/internal/token/Token.controller';
import { SQLMeliTokenRepository } from 'src/app/driver/repositories/mercadolibre/tokens/SQLMeliTokenRepository';
import { MeliTokenService } from 'src/app/services/mercadolibre/token/MeliTokenService';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [TokenController],
  providers: [
    {
      provide: 'ISQLMeliTokenRepository',
      useClass: SQLMeliTokenRepository
    },
    MeliTokenService
  ],
  exports: [MeliTokenService]
})
export class TokenModule {}
