import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XubioComprobantesController } from 'src/app/controller/xubio/comprobantes/XubioComprobantes.Controller';
import { SQLXubioComprobantesRepository } from 'src/app/driver/repositories/xubio/comprobantes/SQLXubioComprobantesRepository';
import { XubioComprobantesService } from 'src/app/services/xubio/comprobantes/XubioComprobantesService';

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
  controllers: [XubioComprobantesController],
  providers: [
    XubioComprobantesService,
    {
      provide: 'ISQLXubioComprobantesRepository',
      useClass: SQLXubioComprobantesRepository
    }
  ],
  exports: [XubioComprobantesService]
})
export class XubioComprobantesModule {}
