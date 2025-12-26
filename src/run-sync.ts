import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './app/worker/worker.module';
import { AutomeliSyncCronService } from './app/worker/AutomeliSyncCron.service';

async function runOnce() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  const syncService = app.get(AutomeliSyncCronService);

  console.log('Running sync manually...');
  const stats = await syncService.runSync();
  console.log('Sync completed:', stats);

  await app.close();
  process.exit(0);
}

runOnce().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});

