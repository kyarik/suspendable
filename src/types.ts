export interface Resource<T> {
  clearError: () => void;
  get: () => T | null;
  load: () => Promise<T>;
  read: () => T;
}

export type Loader<T> = () => Promise<T>;

export interface ResourceOptions {
  autoRetry?: boolean;
  autoRetryTimeoutMs?: number;
}
