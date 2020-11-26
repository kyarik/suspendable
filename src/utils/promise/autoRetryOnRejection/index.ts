import { wait } from '../wait';

interface Options {
  timeoutMs?: number;
}

/**
 * Given a function that returns a promise, keeps calling it until the returned
 * promise resolves, returning the result. If the promise rejects, waits
 * `timeoutMs` before retrying again.
 * @param fn The function that returns a promise.
 * @param options Options that can be used to adjust the retry timeout (default 3000).
 */
export const autoRetryOnRejection = async <T extends any>(
  fn: () => Promise<T>,
  options: Options = {},
) => {
  const { timeoutMs = 3000 } = options;

  while (true) {
    try {
      const result = await fn();

      return result;
    } catch {
      await wait(timeoutMs);
    }
  }
};
