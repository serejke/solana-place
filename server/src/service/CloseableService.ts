export interface CloseableService {
  close(): Promise<void>;
}
