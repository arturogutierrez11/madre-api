import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { MercadoLibreProduct } from 'src/core/entities/mercadolibre/itemsDetails/MercadoLibreProduct';

@Injectable()
export class MeliProductImportHasher {
  computeHash(product: MercadoLibreProduct): string {
    const hashString = [
      product.sellerSku,
      product.title,
      product.price,
      product.stock,
      (product.pictures ?? []).join(',')
    ].join('|');

    return createHash('md5').update(hashString).digest('hex');
  }
}
