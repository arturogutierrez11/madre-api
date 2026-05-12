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

export interface IAutomeliProductSnapshotsRepository {
  upsertBulk(products: AutomeliProduct[]): Promise<number>;

  findBySkus(skus: string[]): Promise<AutomeliProductSnapshotRecord[]>;
}
