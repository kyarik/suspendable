import { invariant } from 'circumspect';
import { Loader, Resource, ResourceOptions } from '../types';
import { autoRetryOnRejection } from '../utils/promise/autoRetryOnRejection';

const resourcesWithError = new Set<Resource<unknown>>();

/**
 * Creates a lazy resource. It's lazy because it will not start loading the
 * resource immediately. Instead, it will start loading it only when the `load`
 * method is called. The resource can be read at any point inside a React
 * component - if it has not loaded at the time it is called, the component
 * will suspend.
 * @param loader the loader function to load a resource of type `T`. This is a
 *    regular function that returns a promise.
 * @param options the resource options.
 * @returns a resource of type `T`.
 */
export const lazyResource = <T>(
  loader: Loader<T>,
  options: ResourceOptions = {},
): Resource<T> => {
  const { autoRetry = false, autoRetryTimeoutMs = 3000 } = options;

  let promise: Promise<T> | null = null;
  let error: Error | null = null;
  let result: T | null = null;

  const getPromise = () => {
    if (autoRetry) {
      return autoRetryOnRejection(loader, { timeoutMs: autoRetryTimeoutMs });
    }

    return loader();
  };

  const load = () => {
    if (!promise) {
      promise = getPromise()
        .then(r => {
          result = r;

          return r;
        })
        .catch(err => {
          error = err;

          resourcesWithError.add(resource);

          throw err;
        });
    }

    return promise;
  };

  const get = () => result;

  const read = () => {
    invariant(
      promise,
      'You must start loading the resource with resource.load() before trying to read it with resource.read()',
    );

    if (result !== null) {
      return result;
    }

    if (error !== null) {
      throw error;
    }

    throw promise;
  };

  const clearError = () => {
    if (error !== null) {
      promise = null;
      error = null;

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
 */
export const clearResourceErrors = () => {
  resourcesWithError.forEach(resource => resource.clearError());

  resourcesWithError.clear();
};
