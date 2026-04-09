import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IMeliApiDescriptionRepository,
  MeliApiItemDescription
} from 'src/core/adapters/repositories/meliapi/description/IMeliApiDescriptionRepository';

const DEFAULT_MELI_GATEWAY_BASE_URL = 'https://api.meli.loquieroaca.com';
const FETCH_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 500;

@Injectable()
export class MeliApiDescriptionRepository implements IMeliApiDescriptionRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'MELI_GATEWAY_BASE_URL',
      DEFAULT_MELI_GATEWAY_BASE_URL
    );
  }

  async getItemDescription(itemId: string): Promise<MeliApiItemDescription> {
    if (!itemId) return { plainText: '' };

    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/meli/products/${itemId}/description`
        );

        return { plainText: response.data?.plain_text ?? '' };
      } catch (error: any) {
        if (error.response?.status === 404) {
          return { plainText: '' };
        }

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
          continue;
        }

        console.error(
          `[MeliApiDescriptionRepository] Failed to get description for ${itemId} after ${FETCH_RETRIES} retries:`,
          error.response?.status ?? error.message
        );
        return { plainText: '' };
      }
    }

    return { plainText: '' };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
