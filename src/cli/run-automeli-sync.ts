import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AutomeliSyncWorkerModule } from 'src/app/module/madre/sync/AutomeliSyncWorker.module';
import { SyncMadreDbFromAutomeli } from 'src/core/interactors/madre/SyncMadreDbFromAutomeli';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AutomeliSyncWorkerModule);

  const syncService = app.get(SyncMadreDbFromAutomeli);

  console.log('🚀 Ejecutando sync manual...');
  await syncService.runSync();
  console.log('✅ Sync finalizado');

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Error en sync', err);
  process.exit(1);
});
