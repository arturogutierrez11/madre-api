import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ISQLMeliTokenRepository } from 'src/core/adapters/repositories/mercadolibre/tokens/ISQLMeliTokenRepository';
import { MeliTokenDTO } from 'src/core/entities/mercadolibre/tokens/dto/MeliTokenDTO';

@Injectable()
export class MeliTokenService {
  constructor(
    @Inject('ISQLMeliTokenRepository')
    private readonly meliTokenRepository: ISQLMeliTokenRepository
  ) {}

  async getLastToken(): Promise<MeliTokenDTO | null> {
    return this.meliTokenRepository.getToken();
  }

  async saveToken(token: MeliTokenDTO): Promise<void> {
    const tokenToSave = this.normalizeAndValidate(token);
    await this.meliTokenRepository.saveToken(tokenToSave);
  }

  async upsertToken(token: MeliTokenDTO): Promise<void> {
    const tokenToSave = this.normalizeAndValidate(token);

    const lastToken = await this.meliTokenRepository.getToken();

    if (!lastToken) {
      await this.meliTokenRepository.saveToken(tokenToSave);
      return;
    }

    await this.meliTokenRepository.updateLastToken(tokenToSave);
  }

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

    const expiresAt = new Date(Date.now() + token.expires_in * 1000);

    return {
      ...token,
      expires_at: expiresAt
    };
  }
}
