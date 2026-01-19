import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './common/swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  setupSwagger(app, 'Madre API', 'API principal de Madre DB', ['']);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  console.log(`API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
