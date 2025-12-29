import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';
import { mapAutomeliProduct } from './mapper/mapAutomeliProduct';

@Injectable()
export class AutomeliProductsRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTOMELI_BASE_URL', '');
  }

  async getLoadedProducts(params: {
    sellerId: string;
    appStatus?: number;
    aux?: number;
  }): Promise<AutomeliProduct[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-loaded-products/`, {
        params: {
          seller_id: params.sellerId,
          app_status: params.appStatus ?? 1,
          aux: params.aux ?? 1,
        }
      });

      const data = response.data?.data ?? response.data;
      return (data ?? [])
        .map(mapAutomeliProduct)
        .filter(p => p.listingTypeId === 'gold_special');
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'Unknown error';
      console.error(`[AutomeliRepo] API Error: ${status} - ${message}`, {
        url: `${this.baseUrl}/get-loaded-products/`,
        params: { seller_id: params.sellerId, aux: params.aux }
      });
      throw new HttpException(`Error obteniendo productos desde Automeli: ${message}`, status);
    }
  }
}
