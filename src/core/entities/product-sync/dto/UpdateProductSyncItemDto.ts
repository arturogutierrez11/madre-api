import { ProductSyncStatus } from '../ProductSyncStatus';

export class UpdateProductSyncItemDto {
  sellerSku: string;

  price?: number;
  stock?: number;
  status?: ProductSyncStatus;

  raw?: Record<string, any>;
}
