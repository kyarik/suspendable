import { autoRetryOnRejection } from '..';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const aSuccessLoader = () => {
  const result = { success: true };
  const promise = Promise.resolve(result);
  const loader = jest.fn(() => promise);

  return {
    result,
    loader,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

jest.useFakeTimers();

describe('autoRetryOnRejection', () => {
  it('does not auto-retry if the promise resolves the first time', async () => {
    const { loader, result } = aSuccessLoader();

    const promise = autoRetryOnRejection(loader);

    const value = await promise;

    expect(value).toBe(result);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('auto-retries if the promise rejects', async () => {
    const { loader, result } = anErrorThenSuccessLoader();

    const promise = autoRetryOnRejection(loader);

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

  it('auto-retries respecting the passed timeoutMs', async () => {
    const { loader, result } = anErrorThenSuccessLoader();

    const promise = autoRetryOnRejection(loader, { timeoutMs: 10000 });

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
