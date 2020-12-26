import { wait } from '../wait';

interface Options {
  timeoutMs?: number;
}

const autoRetryOnRejectionRec = <T extends any>(
  fn: () => Promise<T>,
  options: Required<Options>,
): Promise<T> =>
  fn().catch(() =>
    wait(options.timeoutMs).then(() => autoRetryOnRejectionRec(fn, options)),
  );

/**
 * Given a function that returns a promise, keeps calling it until the returned
 * promise resolves, returning the result. If the promise rejects, waits
 * `timeoutMs` before retrying again.
 * @param fn The function that returns a promise.
 * @param options Options that can be used to adjust the retry timeout (default 3000).
 */
export const autoRetryOnRejection = <T extends any>(
  fn: () => Promise<T>,
  options: Options = {},
) => {
  const { timeoutMs = 3000 } = options;

  return autoRetryOnRejectionRec(fn, { timeoutMs });
};
