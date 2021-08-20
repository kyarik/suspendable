import { wait } from '..';

jest.useFakeTimers();

describe('wait', () => {
  it('returns a promise that resolves after the specified amount of time', async () => {
    let value = 1;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    wait(1000).then(() => {
      value++;
    });

    expect(value).toBe(1);

    jest.advanceTimersByTime(500);

    await Promise.resolve();

    expect(value).toBe(1);

    jest.advanceTimersByTime(500);

    await Promise.resolve();

    expect(value).toBe(2);
  });
});
