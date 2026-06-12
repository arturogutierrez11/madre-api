import { Inject, Injectable } from '@nestjs/common';
import {
  AutomeliProductSnapshotsListParams,
  AutomeliProductSnapshotRecord,
  IAutomeliProductSnapshotsRepository
} from 'src/core/adapters/repositories/automeli/snapshots/IAutomeliProductSnapshotsRepository';

const ALLOWED_FIELDS: Array<keyof AutomeliProductSnapshotRecord> = [
  'mla',
  'sku',
  'totalPrice',
  'scrapedPrice',
  'stockQuantity',
  'amzStatus',
  'changed',
  'maxWeight',
  'meliSalePrice',
  'meliStatus',
  'listingTypeId',
  'subStatus',
  'appStatus',
  'createdAt',
  'updatedAt'
];

@Injectable()
export class AutomeliProductSnapshotsService {
  constructor(
    @Inject('IAutomeliProductSnapshotsRepository')
    private readonly snapshotsRepository: IAutomeliProductSnapshotsRepository
  ) {}

  async findBySkus(params: {
    skus: string[];
    fields?: string[];
    uniqueBySku?: boolean;
  }): Promise<{ items: Array<Partial<AutomeliProductSnapshotRecord>>; total: number }> {
    const items = await this.snapshotsRepository.findBySkus(params.skus);
    const deduplicatedItems = params.uniqueBySku ? this.uniqueBySku(items) : items;
    const selectedFields = this.normalizeFields(params.fields);
    const projectedItems = deduplicatedItems.map(item => this.pickFields(item, selectedFields));

    return {
      items: projectedItems,
      total: projectedItems.length
    };
  }

  async findAll(params: AutomeliProductSnapshotsListParams) {
    return this.snapshotsRepository.findAll({
      ...params,
      limit: Math.min(Math.max(Number(params.limit) || 50, 1), 500),
      offset: Math.max(Number(params.offset) || 0, 0)
    });
  }

  private uniqueBySku(items: AutomeliProductSnapshotRecord[]) {
    const map = new Map<string, AutomeliProductSnapshotRecord>();

    for (const item of items) {
      if (!map.has(item.sku)) {
        map.set(item.sku, item);
      }
    }

    return Array.from(map.values());
  }

  private normalizeFields(fields?: string[]): Array<keyof AutomeliProductSnapshotRecord> {
    if (!fields?.length) {
      return ALLOWED_FIELDS;
    }

    const normalized = fields
      .map(field => String(field ?? '').trim())
      .filter((field): field is keyof AutomeliProductSnapshotRecord =>
        ALLOWED_FIELDS.includes(field as keyof AutomeliProductSnapshotRecord)
      );

    if (!normalized.includes('sku')) {
      normalized.unshift('sku');
    }

    return normalized.length ? normalized : ALLOWED_FIELDS;
  }

  private pickFields(
    item: AutomeliProductSnapshotRecord,
    fields: Array<keyof AutomeliProductSnapshotRecord>
  ): Partial<AutomeliProductSnapshotRecord> {
    const projected: Partial<AutomeliProductSnapshotRecord> = {};
    const projectedRecord = projected as Record<string, string | number | null>;

    for (const field of fields) {
      projectedRecord[field] = item[field];
    }

    return projected;
  }
}
