import { MeliTokenDTO } from 'src/core/entities/mercadolibre/tokens/dto/MeliTokenDTO';

export interface ISQLMeliTokenRepository {
  getToken(): Promise<MeliTokenDTO | null>;
  saveToken(data: MeliTokenDTO): Promise<void>;
  updateLastToken(data: MeliTokenDTO): Promise<void>;
}
