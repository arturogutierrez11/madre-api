import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const host = process.env.REDIS_HOST;
        const port = Number(process.env.REDIS_PORT);
        const username = process.env.REDIS_USERNAME;
        const password = process.env.REDIS_PASSWORD;

        if (!host || !port) {
          throw new Error('[REDIS_CLIENT] Missing REDIS_HOST/REDIS_PORT.');
        }

        return new Redis({
          host,
          port,
          username,
          password,
          tls: {},
          maxRetriesPerRequest: 3
        });
      }
    }
  ],
  exports: ['REDIS_CLIENT']
})
export class RedisClientModule {}

