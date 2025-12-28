import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

@Injectable()
export class ProductStateHasher {
  computeHash(product: AutomeliProduct): string {
    const hashString = [
      product.sku,
      product.meliSalePrice,
      product.stockQuantity,
      product.meliStatus,
      product.manufacturingTime ?? ''
    ].join('|');

    return createHash('md5').update(hashString).digest('hex');
  }

  /**
   * Parse manufacturing time string to extract numeric days
   * "10 dias" -> 10
   * "5 días hábiles" -> 5
   */
  parseManufacturingTime(value: string | null): number | null {
    if (!value) return null;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }
}


