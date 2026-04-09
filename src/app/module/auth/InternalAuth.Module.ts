import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalAuthController } from 'src/app/controller/internal/auth/InternalAuth.Controller';
import { SQLRefreshTokenRepository } from 'src/app/driver/repositories/auth/SQLRefreshTokenRepository';
import { SQLUserRepository } from 'src/app/driver/repositories/auth/SQLUserRepository';
import { InternalAuthService } from 'src/app/services/auth/InternalAuthService';

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
  controllers: [InternalAuthController],
  providers: [
    InternalAuthService,
    {
      provide: 'IUserRepository',
      useClass: SQLUserRepository
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: SQLRefreshTokenRepository
    }
  ],
  exports: [InternalAuthService]
})
export class InternalAuthModule {}
