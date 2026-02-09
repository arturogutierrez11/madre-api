export type SyncStatus = 'running' | 'done' | 'failed';

export interface SyncState {
  processName: string;
  sellerId: string;
  lastOffset: number;
  status: SyncStatus;
  updatedAt: Date;
}

export interface ISyncStatesRepository {
  get(params: { processName: string; sellerId: string }): Promise<SyncState | null>;

  upsert(params: { processName: string; sellerId: string; lastOffset: number; status: SyncStatus }): Promise<void>;
}
