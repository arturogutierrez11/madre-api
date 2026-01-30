import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  AutomeliPaginatedResponse,
  IAutomeliProductsRepository
} from 'src/core/adapters/repositories/automeli/products/IAutomeliProductsRepository';
import { mapAutomeliProduct } from './mapper/mapAutomeliProduct';

@Injectable()
export class AutomeliProductsRepository implements IAutomeliProductsRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTOMELI_BASE_URL', '');
  }

  async getLoadedProducts(params: {
    sellerId: string;
    appStatus?: number;
    cursor?: string;
  }): Promise<AutomeliPaginatedResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-products-cursor/`, {
        params: {
          seller_id: params.sellerId,
          app_status: params.appStatus ?? 1,
          ...(params.cursor && { cursor: params.cursor })
        }
      });

      const rawData = response.data?.data ?? [];
      const filteredData = rawData
        .map(mapAutomeliProduct)
        .filter(p => p.listingTypeId === 'gold_special');

      return {
        data: filteredData,
        next_cursor: response.data?.next_cursor ?? null,
        has_more: response.data?.has_more ?? false,
        count: response.data?.count ?? 0
      };
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'Unknown error';
      console.error(`[AutomeliRepo] API Error: ${status} - ${message}`, {
        url: `${this.baseUrl}/get-products-cursor/`,
        params: { seller_id: params.sellerId, cursor: params.cursor }
      });
      throw new HttpException(`Error obteniendo productos desde Automeli: ${message}`, status);
    }
  }
}
