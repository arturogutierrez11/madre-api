export interface IProductDeltaCursorRepository {
  getCursor(syncKey: string): Promise<number>;
  updateCursor(syncKey: string, lastDeltaId: number): Promise<void>;
}
