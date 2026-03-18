export interface ISQLMegatoneBrandMatchRepository {
  saveMatch(data: {
    meliBrand: string;
    megatoneBrandId: string;
    megatoneBrandName: string;
    confidence: number;
  }): Promise<void>;

  existsByMegatoneBrandId(megatoneBrandId: string): Promise<boolean>;
  findByMeliBrand(meliBrand: string): Promise<{
    id: number;
    meli_brand: string;
    megatone_brand_id: string;
    megatone_brand_name: string;
    confidence: number;
    created_at: Date;
  } | null>;
}
