import { wait } from '.';

it('returns a promise that resolves after the specified amount of time', async () => {
  jest.useFakeTimers();

  let value: number = 1;

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

  jest.useRealTimers();
});
