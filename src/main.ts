import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { setupSwagger } from './common/swagger/swagger.setup';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false
    })
  );

  app.useBodyParser('json', { limit: process.env.MADRE_BODY_LIMIT ?? '10mb' });
  app.useBodyParser('urlencoded', {
    limit: process.env.MADRE_BODY_LIMIT ?? '10mb',
    extended: true
  });

  setupSwagger(app, 'Madre API', 'API principal de Madre DB', ['']);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  console.log(`API running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
