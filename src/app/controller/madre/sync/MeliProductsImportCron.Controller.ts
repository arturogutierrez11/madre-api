import { Controller } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { SyncMadreDbFromMeliProductsDb } from 'src/core/interactors/madre/SyncMadreDbFromMeliProductsDb';

@ApiTags('Meli Products Import')
@Controller('meli-products/import')
export class MeliProductsImportCronController {
  constructor(private readonly syncMadreDbFromMeliProductsDb: SyncMadreDbFromMeliProductsDb) {}

  @Cron('0 0 0,6,12,18 * * *', {
    timeZone: 'America/Argentina/Buenos_Aires'
  })
  async handleCron() {
    console.log('[MeliProductsImport] Cron triggered at', new Date().toISOString());
    await this.syncMadreDbFromMeliProductsDb.runSync();
  }
}
