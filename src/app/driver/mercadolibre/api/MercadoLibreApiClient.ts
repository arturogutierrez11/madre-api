import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IMercadoLibreApiClient,
  MeliItemDescription
} from 'src/core/adapters/mercadolibre/api/IMercadoLibreApiClient';
import { MeliTokenService } from 'src/app/services/mercadolibre/token/MeliTokenService';

const MELI_API_BASE_URL = 'https://api.mercadolibre.com';
const FETCH_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 500;

@Injectable()
export class MercadoLibreApiClient implements IMercadoLibreApiClient {
  private cachedAccessToken: string | null = null;
  private readonly categoryCache = new Map<string, string>();

  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly tokenService: MeliTokenService,
    private readonly configService: ConfigService
  ) {
    this.clientId = this.configService.get<string>('MELI_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('MELI_CLIENT_SECRET', '');
  }

  async getItemDescription(itemId: string): Promise<MeliItemDescription> {
    const accessToken = await this.getAccessToken();

    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await axios.get(
          `${MELI_API_BASE_URL}/items/${itemId}/description`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        return { plainText: response.data?.plain_text ?? '' };
      } catch (error: any) {
        if (error.response?.status === 401 && attempt === 1) {
          this.cachedAccessToken = null;
          const freshToken = await this.getAccessToken();
          try {
            const retryResponse = await axios.get(
              `${MELI_API_BASE_URL}/items/${itemId}/description`,
              { headers: { Authorization: `Bearer ${freshToken}` } }
            );
            return { plainText: retryResponse.data?.plain_text ?? '' };
          } catch (retryError: any) {
            console.error(
              `[MeliApiClient] Failed to get description for ${itemId} after token refresh:`,
              retryError.response?.status ?? retryError.message
            );
            return { plainText: '' };
          }
        }

        if (error.response?.status === 404) {
          return { plainText: '' };
        }

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
          continue;
        }

        console.error(
          `[MeliApiClient] Failed to get description for ${itemId} after ${FETCH_RETRIES} retries:`,
          error.response?.status ?? error.message
        );
        return { plainText: '' };
      }
    }

    return { plainText: '' };
  }

  async getCategoryPath(categoryId: string): Promise<string> {
    if (!categoryId) return '';

    const cached = this.categoryCache.get(categoryId);
    if (cached !== undefined) return cached;

    const accessToken = await this.getAccessToken();

    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const response = await axios.get(
          `${MELI_API_BASE_URL}/categories/${categoryId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const pathFromRoot: { id: string; name: string }[] = response.data?.path_from_root ?? [];
        const path = pathFromRoot.map(node => node.name).join(' > ');
        this.categoryCache.set(categoryId, path);
        return path;
      } catch (error: any) {
        if (error.response?.status === 401 && attempt === 1) {
          this.cachedAccessToken = null;
          const freshToken = await this.getAccessToken();
          try {
            const retryResponse = await axios.get(
              `${MELI_API_BASE_URL}/categories/${categoryId}`,
              { headers: { Authorization: `Bearer ${freshToken}` } }
            );
            const pathFromRoot: { id: string; name: string }[] = retryResponse.data?.path_from_root ?? [];
            const path = pathFromRoot.map(node => node.name).join(' > ');
            this.categoryCache.set(categoryId, path);
            return path;
          } catch (retryError: any) {
            console.error(
              `[MeliApiClient] Failed to get category ${categoryId} after token refresh:`,
              retryError.response?.status ?? retryError.message
            );
            this.categoryCache.set(categoryId, '');
            return '';
          }
        }

        if (error.response?.status === 404) {
          this.categoryCache.set(categoryId, '');
          return '';
        }

        if (attempt < FETCH_RETRIES) {
          const delayMs = FETCH_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delayMs);
          continue;
        }

        console.error(
          `[MeliApiClient] Failed to get category ${categoryId} after ${FETCH_RETRIES} retries:`,
          error.response?.status ?? error.message
        );
        this.categoryCache.set(categoryId, '');
        return '';
      }
    }

    return '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedAccessToken) {
      return this.cachedAccessToken;
    }

    const storedToken = await this.tokenService.getLastToken();

    if (!storedToken) {
      throw new Error('[MeliApiClient] No refresh token found in database. Cannot authenticate with MercadoLibre API.');
    }

    if (!this.tokenService.isTokenExpired(storedToken)) {
      this.cachedAccessToken = storedToken.access_token;
      return this.cachedAccessToken;
    }

    return this.refreshAccessToken(storedToken.refresh_token);
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    console.log('[MeliApiClient] Refreshing access token...');

    try {
      const response = await axios.post(`${MELI_API_BASE_URL}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken
      });

      const { access_token, refresh_token, expires_in } = response.data;

      await this.tokenService.upsertToken({
        access_token,
        refresh_token,
        expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000)
      });

      this.cachedAccessToken = access_token;
      console.log('[MeliApiClient] Access token refreshed successfully');

      return access_token;
    } catch (error: any) {
      const status = error.response?.status ?? 'unknown';
      const message = error.response?.data?.message ?? error.message ?? 'Unknown error';
      throw new Error(`[MeliApiClient] Failed to refresh token: ${status} - ${message}`);
    }
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
