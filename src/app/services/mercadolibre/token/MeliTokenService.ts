import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ISQLMeliTokenRepository } from 'src/core/adapters/repositories/mercadolibre/tokens/ISQLMeliTokenRepository';
import { MeliTokenDTO } from 'src/core/entities/mercadolibre/tokens/dto/MeliTokenDTO';

@Injectable()
export class MeliTokenService {
  private static readonly DEFAULT_APP_KEY = 'default';

  constructor(
    @Inject('ISQLMeliTokenRepository')
    private readonly meliTokenRepository: ISQLMeliTokenRepository
  ) {}

  /**
   * Devuelve el último token asociado al client_id actual
   */
  async getLastToken(appKey?: string): Promise<MeliTokenDTO | null> {
    return this.meliTokenRepository.getToken(this.normalizeAppKey(appKey));
  }

  /**
   * Inserta un nuevo token (OAuth inicial)
   */
  async saveToken(token: MeliTokenDTO): Promise<void> {
    const tokenToSave = this.normalizeAndValidate(token);
    await this.meliTokenRepository.saveToken(tokenToSave);
  }

  /**
   * Inserta o actualiza el token del client_id actual
   */
  async upsertToken(token: MeliTokenDTO): Promise<void> {
    const tokenToSave = this.normalizeAndValidate(token);

    const lastToken = await this.meliTokenRepository.getToken(tokenToSave.app_key!);

    if (!lastToken) {
      await this.meliTokenRepository.saveToken(tokenToSave);
      return;
    }

    await this.meliTokenRepository.updateLastToken(tokenToSave);
  }

  /**
   * Check simple de expiración (sin threshold)
   * El threshold vive en el interactor de acceso
   */
  isTokenExpired(token: MeliTokenDTO): boolean {
    return new Date(token.expires_at).getTime() <= Date.now();
  }

  /**
   * ============================
   * Validación + normalización
   * ============================
   */
  private normalizeAndValidate(token: MeliTokenDTO): MeliTokenDTO {
    if (!token) {
      throw new BadRequestException('Token payload is required');
    }

    if (!token.access_token || token.access_token.trim() === '') {
      throw new BadRequestException('access_token is required');
    }

    if (!token.refresh_token || token.refresh_token.trim() === '') {
      throw new BadRequestException('refresh_token is required');
    }

    if (typeof token.expires_in !== 'number' || token.expires_in <= 0) {
      throw new BadRequestException('expires_in must be a number greater than 0');
    }

    // 🔥 siempre recalculamos expires_at en base a expires_in
    const expiresAt = new Date(Date.now() + token.expires_in * 1000);

    return {
      app_key: this.normalizeAppKey(token.app_key),
      access_token: token.access_token.trim(),
      refresh_token: token.refresh_token.trim(),
      expires_in: token.expires_in,
      expires_at: expiresAt
    };
  }

  private normalizeAppKey(appKey?: string): string {
    const normalized = appKey?.trim();
    return normalized && normalized.length > 0 ? normalized : MeliTokenService.DEFAULT_APP_KEY;
  }
}
