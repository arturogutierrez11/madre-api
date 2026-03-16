export interface ISQLBrandMatchRepository {
  saveMatch(data: {
    meliBrand: string;
    fravegaBrandId: string;
    fravegaBrandName: string;
    confidence: number;
  }): Promise<void>;

  existsByFravegaBrandId(fravegaBrandId: string): Promise<boolean>;
}
