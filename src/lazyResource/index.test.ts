import { clearResourceErrors, lazyResource } from '.';

beforeEach(() => jest.useFakeTimers());

const aSuccessLoader = () => {
  const result = { success: true };
  const promise = Promise.resolve(result);
  const loader = jest.fn(() => promise);

  return {
    result,
    loader,
  };
};

const anErrorLoader = () => {
  const error = new Error('Failed to load');
  const promise = Promise.reject(error);
  const loader = jest.fn(() => promise);

  return {
    error,
    loader,
  };
};

const anErrorThenSuccessLoader = () => {
  const result = { success: true };
  const error = new Error('Failed to load');
  const resolvedPromise = Promise.resolve(result);
  const rejectedPromise = Promise.reject(error);
  const loader = jest.fn(() => resolvedPromise);

  loader.mockReturnValueOnce(rejectedPromise);

  return {
    result,
    error,
    loader,
  };
};

describe('lazyResource', () => {
  describe('get', () => {
    it('returns null while the resource has not loaded', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      expect(resource.get()).toBe(null);

      resource.load();

      expect(resource.get()).toBe(null);
    });

    it('returns the result when the resource loaded', async () => {
      const { loader, result } = aSuccessLoader();

      const resource = lazyResource(loader);

      await resource.load();

      expect(resource.get()).toBe(result);
    });

    it('returns null when the resource fails to loaded', async () => {
      const { loader } = anErrorLoader();

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch {}

      expect(resource.get()).toBe(null);
    });
  });

  describe('read', () => {
    it('throws an invariant violation error if called before the resource starts loading', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      expect(() => resource.read()).toThrowErrorMatchingInlineSnapshot(
        `"Invariant violation. You must start loading the resource with resource.load() before trying to read it with resource.read()"`,
      );
    });

    it('throws the resource promise while the resource is loading', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      const promise = resource.load();

      // toThrow does not work with promises
      let thrownValue: unknown = null;

      try {
        resource.read();
      } catch (value) {
        thrownValue = value;
      }

      expect(thrownValue).toBe(promise);
    });

    it('returns the result when the resource loaded', async () => {
      const { loader, result } = aSuccessLoader();

      const resource = lazyResource(loader);

      await resource.load();

      expect(resource.read()).toBe(result);
    });

    it('throws the promise rejection error when the resource fails to loaded', async () => {
      const { loader, error } = anErrorLoader();

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch {}

      expect(() => resource.read()).toThrow(error);
    });

    it('allows the result to be null', async () => {
      const promise = Promise.resolve(null);
      const loader = jest.fn(() => promise);

      const resource = lazyResource(loader);

      await resource.load();

      expect(resource.read()).toBe(null);
    });

    it('does not require the error to be an Error object', async () => {
      expect.assertions(1);

      const promise = Promise.reject(0);
      const loader = jest.fn(() => promise);

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch {}

      try {
        resource.read();
      } catch (err) {
        expect(err).toBe(0);
      }
    });

    it('allows the error to be null', async () => {
      expect.assertions(1);

      const promise = Promise.reject(null);
      const loader = jest.fn(() => promise);

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch {}

      try {
        resource.read();
      } catch (err) {
        expect(err).toBe(null);
      }
    });
  });

  describe('load', () => {
    it('calls the loader', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      resource.load();

      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('returns a promise that resolves with the result if the loader promise resolves', async () => {
      const { loader, result } = aSuccessLoader();

      const resource = lazyResource(loader);

      const promise = resource.load();

      const value = await promise;

      expect(value).toBe(result);
    });

    it('returns a promise that rejects with the rejection error if the loader promise rejects', async () => {
      expect.assertions(1);

      const { loader, error } = anErrorLoader();

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('calls the loader one time even if called multiple times', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      const promise1 = resource.load();
      const promise2 = resource.load();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2);
    });

    it('returns the same promise after the resource loaded', async () => {
      const { loader } = aSuccessLoader();

      const resource = lazyResource(loader);

      const promise1 = resource.load();

      await promise1;

      const promise2 = resource.load();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2);
    });

    it('returns the same promise after the resource fails to load', async () => {
      const { loader } = anErrorLoader();

      const resource = lazyResource(loader);

      const promise1 = resource.load();

      try {
        await promise1;
      } catch {}

      const promise2 = resource.load();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2);
    });

    it('auto-retries calling the loader if autoRetry is true and the promise rejects', async () => {
      const { loader, result } = anErrorThenSuccessLoader();

      const resource = lazyResource(loader, { autoRetry: true });

      const promise = resource.load();

      // Allow the loader promise to reject
      await Promise.resolve();

      jest.advanceTimersByTime(2000);

      await Promise.resolve();

      expect(loader).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      await Promise.resolve();

      expect(loader).toHaveBeenCalledTimes(2);

      const value = await promise;

      expect(value).toBe(result);
    });

    it('auto-retries calling the loader if autoRetry is true, respecting the autoRetryTimeoutMs', async () => {
      const { loader, result } = anErrorThenSuccessLoader();

      const resource = lazyResource(loader, {
        autoRetry: true,
        autoRetryTimeoutMs: 10000,
      });

      const promise = resource.load();

      // Allow the loader promise to reject and set the timer
      await Promise.resolve();

      jest.advanceTimersByTime(5000);

      await Promise.resolve();

      expect(loader).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(5000);

      await Promise.resolve();

      expect(loader).toHaveBeenCalledTimes(2);

      const value = await promise;

      expect(value).toBe(result);
    });
  });

  describe('clearError', () => {
    it('has no effect before the resource even starts loading', async () => {
      expect.assertions(1);

      const { loader, error } = anErrorLoader();

      const resource = lazyResource(loader);

      resource.clearError();

      try {
        await resource.load();
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('has no effect after the resource loaded successfully', async () => {
      const { loader, result } = aSuccessLoader();

      const resource = lazyResource(loader);

      await resource.load();

      resource.clearError();

      expect(resource.get()).toBe(result);

      await resource.load();

      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('clears the error if called after the resource failed to load', async () => {
      expect.assertions(3);

      const { loader, error, result } = anErrorThenSuccessLoader();

      const resource = lazyResource(loader);

      try {
        await resource.load();
      } catch (err) {
        expect(err).toBe(error);
      }

      resource.clearError();

      const value = await resource.load();

      expect(value).toBe(result);
      expect(loader).toHaveBeenCalledTimes(2);
    });
  });
});

describe('clearResourceErrors', () => {
  it('clears resource errors', async () => {
    expect.assertions(6);

    const {
      loader: loader1,
      error: error1,
      result: result1,
    } = anErrorThenSuccessLoader();

    const {
      loader: loader2,
      error: error2,
      result: result2,
    } = anErrorThenSuccessLoader();

    const resource1 = lazyResource(loader1);
    const resource2 = lazyResource(loader2);

    try {
      await resource1.load();
    } catch (err) {
      expect(err).toBe(error1);
    }

    try {
      await resource2.load();
    } catch (err) {
      expect(err).toBe(error2);
    }

    clearResourceErrors();

    const value1 = await resource1.load();

    expect(value1).toBe(result1);
    expect(loader1).toHaveBeenCalledTimes(2);

    const value2 = await resource2.load();

    expect(value2).toBe(result2);
    expect(loader2).toHaveBeenCalledTimes(2);
  });
});
