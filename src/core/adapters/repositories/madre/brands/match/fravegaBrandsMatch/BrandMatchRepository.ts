export interface ISQLBrandMatchRepository {
  saveMatch(data: {
    meliBrand: string;
    fravegaBrandId: string;
    fravegaBrandName: string;
    confidence: number;
  }): Promise<void>;

  existsByFravegaBrandId(fravegaBrandId: string): Promise<boolean>;
  findByMeliBrand(meliBrand: string): Promise<{
    id: number;
    meli_brand: string;
    megatone_brand_id: string;
    megatone_brand_name: string;
    confidence: number;
    created_at: Date;
  } | null>;
}
