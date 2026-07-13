export interface ISyncLock {
  acquire(): Promise<boolean>;
  release(): Promise<void>;
}


