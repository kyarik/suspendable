import { invariant } from 'circumspect';
import { Loader, Resource, ResourceOptions } from '../types';
import { autoRetryOnRejection } from '../utils/promise/autoRetryOnRejection';

const resourcesWithError = new Set<Resource<unknown>>();

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

export const clearResourceErrors = () => {
  resourcesWithError.forEach(resource => resource.clearError());

  resourcesWithError.clear();
};
