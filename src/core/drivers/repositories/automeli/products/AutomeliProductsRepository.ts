import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

@Injectable()
export class AutomeliProductsRepository {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTOMELI_BASE_URL', '');
  }

  async getLoadedProducts(params: { sellerId: string; appStatus?: number; aux?: number }): Promise<AutomeliProduct[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-loaded-products/`, {
        params: {
          seller_id: params.sellerId,
          app_status: params.appStatus ?? 1,
          aux: params.aux ?? 1
        }
      });

      return response.data.map((item: any) => ({
        sku: item.sku ?? null,
        sellerSku: item.seller_sku ?? null,
        title: item.title ?? null,
        price: item.price !== undefined ? Number(item.price) : null,
        stock: item.stock !== undefined ? Number(item.stock) : null,
        appStatus: item.app_status ?? null,
        aux: item.aux ?? null,
        sellerId: item.seller_id ?? params.sellerId,
        raw: item
      }));
    } catch (error) {
      throw new HttpException('Error obteniendo productos desde Automeli', error.response?.status || 500);
    }
  }
}
