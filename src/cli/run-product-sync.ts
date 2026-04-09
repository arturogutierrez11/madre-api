import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app/app.module';
import { SyncMadreDbFromMeliProductsDb } from 'src/core/interactors/madre/SyncMadreDbFromMeliProductsDb';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const syncService = app.get(SyncMadreDbFromMeliProductsDb);

  console.log('Ejecutando importación de productos desde mercadolibre_products...');
  await syncService.runSync();
  console.log('Importación finalizada');

  await app.close();
}

bootstrap().catch(err => {
  console.error('Error en importación de productos', err);
  process.exit(1);
});
