export interface ISQLAnalyticsCacheCategoriesRepository {
  getCurrentVersion(): Promise<number>;
  getByKey<T>(cacheKey: string, version: number): Promise<T | null>;
  save<T>(cacheKey: string, version: number, data: T): Promise<void>;
  incrementVersion(): Promise<void>;
}
