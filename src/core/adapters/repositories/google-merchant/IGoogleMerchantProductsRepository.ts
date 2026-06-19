export interface GoogleMerchantProductRow {
  [key: string]: string | number | boolean | null;
}

export interface IGoogleMerchantProductsRepository {
  findActiveProducts(limit: number, offset: number): Promise<GoogleMerchantProductRow[]>;
  countActiveProducts(): Promise<number>;
}
