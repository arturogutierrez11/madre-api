export interface IAutomeliProductsStateCache {
  getHashes(skus: string[]): Promise<Map<string, string | null>>;
  setHashes(hashMap: Map<string, string>): Promise<void>;
}


