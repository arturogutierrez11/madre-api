import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app/app.module';
import { SyncMadreDbFromAutomeli } from 'src/core/interactors/madre/SyncMadreDbFromAutomeli';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

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
