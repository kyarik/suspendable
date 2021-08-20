import { assertNever, invariant } from 'circumspect';
import type { Loader, Resource, ResourceOptions } from '../types';
import { autoRetryOnRejection } from '../utils/promise/autoRetryOnRejection';

type State = 'error' | 'pending' | 'success';

const resourcesWithError = new Set<Resource<unknown>>();

/**
 * Creates a lazy resource. It's lazy because it will not start loading the
 * resource immediately. Instead, it will start loading it only when the `load`
 * method is called. The resource can be read at any point inside a React
 * component - if it has not loaded at the time it is read, the component
 * will suspend.
 * @param loader the loader function to load a resource of type `T`. This is a
 *    regular function that returns a promise.
 * @param options the resource options.
 * @returns a resource of type `T`.
 * @public
 */
export const lazyResource = <T>(loader: Loader<T>, options: ResourceOptions = {}): Resource<T> => {
  const { autoRetry = false, autoRetryTimeoutMs } = options;

  let promise: Promise<T> | null = null;
  let error: unknown = null;
  let result: T | null = null;
  let state: State = 'pending';

  const getPromise = (): Promise<T> => {
    if (autoRetry) {
      return autoRetryOnRejection(loader, { timeoutMs: autoRetryTimeoutMs });
    }

    return loader();
  };

  const load = (): Promise<T> => {
    if (!promise) {
      promise = getPromise()
        .then((value) => {
          result = value;
          state = 'success';

          return value;
        })
        .catch((reason) => {
          error = reason;
          state = 'error';

          resourcesWithError.add(resource);

          throw reason;
        });
    }

    return promise;
  };

  const get = (): T | null => result;

  const read = (): T => {
    invariant(
      promise,
      'You must start loading the resource with resource.load() before trying to read it with resource.read()',
    );

    switch (state) {
      case 'success':
        return result as T;
      case 'error':
        throw error;
      case 'pending':
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw promise;
      /* istanbul ignore next: unreachable default case */
      default:
        return assertNever(state);
    }
  };

  const clearError = (): void => {
    if (state === 'error') {
      promise = null;
      error = null;
      state = 'pending';

      resourcesWithError.delete(resource);
    }
  };

  const resource: Resource<T> = {
    clearError,
    get,
    load,
    read,
  };

  return resource;
};

/**
 * Clears the errors for all resources that failed to load. This means that all
 * those resource can retry loading by calling the `Resource#load` method.
 * @public
 */
export const clearResourceErrors = (): void => {
  resourcesWithError.forEach((resource) => {
    resource.clearError();
  });
};
