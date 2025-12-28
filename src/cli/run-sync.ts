import { NestFactory } from '@nestjs/core';
import { AutomeliSyncWorkerModule } from '../app/worker/automeli-sync/AutomeliSyncWorker.module';
import { AutomeliSyncCronService } from '../app/worker/automeli-sync/AutomeliSyncCron.service';

async function runOnce() {
  const app = await NestFactory.createApplicationContext(AutomeliSyncWorkerModule);

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

