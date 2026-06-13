import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

export interface AutomeliProductSnapshotRecord {
  mla: string;
  sku: string;
  totalPrice: number | null;
  scrapedPrice: number | null;
  stockQuantity: number | null;
  amzStatus: string | null;
  changed: string | null;
  maxWeight: number | null;
  meliSalePrice: number | null;
  meliStatus: string | null;
  listingTypeId: string | null;
  subStatus: string | null;
  appStatus: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AutomeliProductSnapshotsListParams {
  limit: number;
  offset: number;
  mla?: string;
  sku?: string;
  totalPrice?: number;
  totalPriceMin?: number;
  totalPriceMax?: number;
  scrapedPrice?: number;
  scrapedPriceMin?: number;
  scrapedPriceMax?: number;
  stockQuantity?: number;
  stockQuantityMin?: number;
  stockQuantityMax?: number;
  amzStatus?: string;
  changed?: string;
  maxWeight?: number;
  maxWeightMin?: number;
  maxWeightMax?: number;
  meliSalePrice?: number;
  meliSalePriceMin?: number;
  meliSalePriceMax?: number;
  meliStatus?: string;
  listingTypeId?: string;
  subStatus?: string;
  appStatus?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

export interface IAutomeliProductSnapshotsRepository {
  upsertBulk(products: AutomeliProduct[]): Promise<number>;

  findBySkus(skus: string[]): Promise<AutomeliProductSnapshotRecord[]>;

  findAll(params: AutomeliProductSnapshotsListParams): Promise<{
    items: AutomeliProductSnapshotRecord[];
    total: number;
    limit: number;
    offset: number;
    count: number;
    hasNext: boolean;
    nextOffset: number | null;
  }>;
}
