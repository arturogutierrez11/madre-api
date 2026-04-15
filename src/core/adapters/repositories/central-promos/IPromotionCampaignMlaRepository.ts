export interface PromotionCampaignMlaRow {
  id: number;
  mla: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface PromotionCampaignMlaExistsResult {
  mla: string;
  exists: boolean;
}

export interface IPromotionCampaignMlaRepository {
  create(mla: string): Promise<PromotionCampaignMlaRow>;
  createBulk(mlas: string[]): Promise<number>;
  checkExistsBulk(mlas: string[]): Promise<PromotionCampaignMlaExistsResult[]>;
  list(limit: number, offset: number): Promise<PromotionCampaignMlaRow[]>;
  count(): Promise<number>;
}
