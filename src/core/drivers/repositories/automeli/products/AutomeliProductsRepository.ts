import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';
import { mapAutomeliProduct } from './mapper/mapAutomeliProduct';

export interface AutomeliPagination {
  page: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedAutomeliResponse {
  products: AutomeliProduct[];
  pagination: AutomeliPagination;
}

@Injectable()
export class AutomeliProductsRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTOMELI_BASE_URL', '');
  }

  async getLoadedProducts(params: {
    sellerId: string;
    appStatus?: number;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedAutomeliResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-loaded-products/`, {
        params: {
          seller_id: params.sellerId,
          app_status: params.appStatus ?? 1,
          page: params.page ?? 1,
          per_page: params.perPage ?? 100
        }
      });

      const { data, pagination } = response.data;

      return {
        products: data.map(mapAutomeliProduct),
        pagination: {
          page: pagination.page,
          perPage: pagination.per_page,
          hasNext: pagination.has_next,
          hasPrev: pagination.has_prev
        }
      };
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'Unknown error';
      console.error(`[AutomeliRepo] API Error: ${status} - ${message}`, {
        url: `${this.baseUrl}/get-loaded-products/`,
        params: { seller_id: params.sellerId, page: params.page }
      });
      throw new HttpException(`Error obteniendo productos desde Automeli: ${message}`, status);
    }
  }
}
