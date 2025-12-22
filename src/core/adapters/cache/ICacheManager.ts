export interface ICacheManager {
  get(key: string): Promise<any>;
  save(key: string, data: any, ttlMs?: number): Promise<void>;
}
