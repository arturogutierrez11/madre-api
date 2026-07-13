import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

export interface AutomeliProductSnapshotRecord {
  mla: string;
  sku: string;
  brand: string | null;
  title: string | null;
  manufacturingTime: string | null;
  pauseReason: string | null;
  pausedSince: string | null;
  totalPrice: number | null;
  scrapedPrice: number | null;
  shippingCost: number | null;
  taxes: number | null;
  stockQuantity: number | null;
  amzStatus: string | null;
  changed: string | null;
  maxWeight: number | null;
  meliSalePrice: number | null;
  discountTotalPrice: number | null;
  meliStatus: string | null;
  listingTypeId: string | null;
  subStatus: string | null;
  appStatus: number | null;
  idMeliMainVariant: string | null;
  image: string | null;
  imageChanged: number | null;
  imageChangedUrl: string | null;
  permalink: string | null;
  meliCategoryName: string | null;
  meliMainCategory: string | null;
  shippingFrom: string | null;
  taxCategoryId: number | null;
  createUsingPublisher: number | null;
  dateUpdated: string | null;
  dateUpdatedMeli: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AutomeliProductSnapshotsListParams {
  limit: number;
  offset: number;
  mla?: string;
  sku?: string;
  brand?: string;
  title?: string;
  manufacturingTime?: string;
  pauseReason?: string;
  pausedSinceFrom?: string;
  pausedSinceTo?: string;
  totalPrice?: number;
  totalPriceMin?: number;
  totalPriceMax?: number;
  scrapedPrice?: number;
  scrapedPriceMin?: number;
  scrapedPriceMax?: number;
  shippingCost?: number;
  shippingCostMin?: number;
  shippingCostMax?: number;
  taxes?: number;
  taxesMin?: number;
  taxesMax?: number;
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
  discountTotalPrice?: number;
  discountTotalPriceMin?: number;
  discountTotalPriceMax?: number;
  meliStatus?: string;
  listingTypeId?: string;
  subStatus?: string;
  appStatus?: number;
  idMeliMainVariant?: string;
  image?: string;
  imageChanged?: number;
  imageChangedUrl?: string;
  permalink?: string;
  meliCategoryName?: string;
  meliMainCategory?: string;
  shippingFrom?: string;
  taxCategoryId?: number;
  createUsingPublisher?: number;
  dateUpdatedFrom?: string;
  dateUpdatedTo?: string;
  dateUpdatedMeliFrom?: string;
  dateUpdatedMeliTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

export interface IAutomeliProductSnapshotsRepository {
  upsertBulk(products: AutomeliProduct[]): Promise<number>;

  findBySkus(skus: string[]): Promise<AutomeliProductSnapshotRecord[]>;

  getLastUpdateInfo(): Promise<{
    total: number;
    lastCreatedAt: string | null;
    lastUpdatedAt: string | null;
  }>;

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
