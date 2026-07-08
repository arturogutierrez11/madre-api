import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceClientIssuesController } from 'src/app/controller/invoice/client-issues/InvoiceClientIssues.Controller';
import { SQLInvoiceClientIssuesRepository } from 'src/app/driver/repositories/invoice/client-issues/SQLInvoiceClientIssuesRepository';
import { InvoiceClientIssuesService } from 'src/app/services/invoice/client-issues/InvoiceClientIssuesService';

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
  controllers: [InvoiceClientIssuesController],
  providers: [
    InvoiceClientIssuesService,
    {
      provide: 'ISQLInvoiceClientIssuesRepository',
      useClass: SQLInvoiceClientIssuesRepository
    }
  ],
  exports: [InvoiceClientIssuesService]
})
export class InvoiceClientIssuesModule {}
