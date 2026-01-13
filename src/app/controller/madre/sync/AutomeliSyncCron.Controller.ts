import { Controller, Post, HttpCode, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SyncMadreDbFromAutomeli } from 'src/core/interactors/madre/SyncMadreDbFromAutomeli';

@ApiTags('Automeli Sync')
@Controller('automeli/sync')
export class AutomeliSyncController {
  constructor(private readonly syncMadreDbFromAutomeli: SyncMadreDbFromAutomeli) {}

  /**
   * ─────────────────────────────
   * CRON
   * ─────────────────────────────
   * Run every 6 hours at 00:00, 06:00, 12:00, 18:00 (Buenos Aires time)
   */
  @Cron('0 0 0,6,12,18 * * *', {
    timeZone: 'America/Argentina/Buenos_Aires'
  })
  async handleCron() {
    console.log('[AutomeliSync] Cron triggered at', new Date().toISOString());
    await this.syncMadreDbFromAutomeli.runSync();
  }
}
