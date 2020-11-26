import { lazyResource } from '.';

it('allows creating a lazy resource', async () => {
  const resource = lazyResource(() => Promise.resolve('hello'));

  expect(resource.get()).toBe(null);

  const promise = resource.load();

  // toThrow does not work with promises
  let thrownValue: unknown = null;

  try {
    resource.read();
  } catch (value) {
    thrownValue = value;
  }

  expect(thrownValue).toBe(promise);

  await promise;

  expect(resource.read()).toBe('hello');
  expect(resource.get()).toBe('hello');
});
