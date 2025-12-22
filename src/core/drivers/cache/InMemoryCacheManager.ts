import { ICacheManager } from 'src/core/adapters/cache/ICacheManager';

export class InMemoryCacheManager implements ICacheManager {
  private database: Map<string, { value: any; expiresAt: number | null }> =
    new Map();

  async get(key: string): Promise<any> {
    const record = this.database.get(key);

    if (!record) return null;

    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.database.delete(key);
      return null;
    }

    return record.value;
  }

  async save(key: string, value: any, ttlMs: number = 1000 * 60 * 60 * 12) {
    this.database.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }
}
