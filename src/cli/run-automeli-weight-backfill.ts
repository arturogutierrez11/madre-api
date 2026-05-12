import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AutomeliSyncWorkerModule } from 'src/app/module/madre/sync/AutomeliSyncWorker.module';
import { BackfillMadreProductWeightsFromAutomeli } from 'src/core/interactors/madre/BackfillMadreProductWeightsFromAutomeli';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AutomeliSyncWorkerModule);

  const syncService = app.get(BackfillMadreProductWeightsFromAutomeli);

  console.log('🚀 Ejecutando backfill manual de max_weight...');
  await syncService.run();
  console.log('✅ Backfill de max_weight finalizado');

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Error en backfill de max_weight', err);
  process.exit(1);
});
