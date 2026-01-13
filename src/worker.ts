import { NestFactory } from '@nestjs/core';
import { AutomeliSyncWorkerModule } from './app/module/madre/sync/AutomeliSyncWorker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AutomeliSyncWorkerModule);

  console.log('Worker started - Automeli Sync Cron active');

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
