export interface ISQLMegatoneBrandMatchRepository {
  saveMatch(data: {
    meliBrand: string;
    megatoneBrandId: string;
    megatoneBrandName: string;
    confidence: number;
  }): Promise<void>;

  existsByMegatoneBrandId(megatoneBrandId: string): Promise<boolean>;
}
