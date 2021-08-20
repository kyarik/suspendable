/** @public */
export interface Resource<T> {
  /**
   * Clears the error in case the resource failed to load. This allows to call
   * the load method again and retry loading the resource. This method has no
   * effect if the resource is still loading or if it already loaded
   * successfully.
   */
  clearError: () => void;

  /**
   * Returns the loaded resource or `null` if the resource is still loading, if
   * it failed to load, or if it didn't even start loading yet.
   */
  get: () => T | null;

  /**
   * Begins loading the resource by calling the provided loader function. This
   * method is idempotent - calling it after the first time has no effect.
   * However, If the resource fails to load and `Resource#clearError()` is
   * called, then calling this method will again begin loading the resource.
   */
  load: () => Promise<T>;

  /**
   * Returns the loaded resource. If the resource is still loading when this
   * method is called, it will throw the resource promise, which will make the
   * React component suspend and show the fallback of the nearest `<Suspense>`
   * ancestor. If the resource failed to load, then this method will throw the
   * error with which the promise rejected, causing the fallback of nearest
   * error boundary ancestor to be shown, if any. This method must be called
   * inside a React component and it can only be called after the resource
   * started loading with `Resource#load()`.
   */
  read: () => T;
}

/** @public */
export type Loader<T> = () => Promise<T>;

/** @public */
export interface ResourceOptions {
  /**
   * Specifies whether to retry loading the resource if it fails to load the
   * first time. When set to `true` and the promise returned by the loader
   * function rejects, it will wait `autoRetryTimeoutMs` milliseconds and call
   * the loader again. It will keep doing this until the promise returned by
   * the loader resolves. (default `false`)
   */
  autoRetry?: boolean;

  /**
   * The number of milliseconds to wait before retrying calling the loader
   * after the promise that the loader previosly returned rejects. This option
   * is applicable only when `autoRetry` is set to `true`. (default `3000`)
   */
  autoRetryTimeoutMs?: number;
}
