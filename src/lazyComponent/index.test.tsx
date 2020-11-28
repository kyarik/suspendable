import React, { FC } from 'react';
import {
  clearLazyComponentError,
  lazyComponent,
  preloadLazyComponent,
} from '.';

const aSuccessLoader = (delayMs = 0) => {
  const Name: FC<{ name: string }> = ({ name }) => {
    return <h1>{name}</h1>;
  };

  const result = { default: Name };
  const loader = jest.fn(
    () =>
      new Promise<typeof result>(resolve =>
        setTimeout(() => resolve(result), delayMs),
      ),
  );

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
  const Name: FC<{ name: string }> = ({ name }) => {
    return <h1>{name}</h1>;
  };

  const result = { default: Name };
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

describe('lazyComponent', () => {
  it('returns a lazy component that suspends while loading', async () => {
    const { loader } = aSuccessLoader();

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    expect(promise).not.toBe(null);

    await promise;

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);
  });

  it('returns a lazy component that throws an error if it fails to load', async () => {
    expect.assertions(2);

    const { loader, error } = anErrorLoader();

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    try {
      await promise;
    } catch (err) {
      expect(err).toBe(error);
    }

    expect(() => LazyComponent(props)).toThrow(error);
  });

  it('auto-retries loading the component if autoRetry is true and the promise rejects', async () => {
    jest.useFakeTimers();

    const { loader } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader, { autoRetry: true });
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    // Allow the loader promise to reject
    await Promise.resolve();

    jest.advanceTimersByTime(2000);

    await Promise.resolve();

    expect(loader).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    await Promise.resolve();

    expect(loader).toHaveBeenCalledTimes(2);

    await promise;

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);

    jest.useRealTimers();
  });

  it('auto-retries calling the loader if autoRetry is true, respecting the autoRetryTimeoutMs', async () => {
    jest.useFakeTimers();

    const { loader } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader, {
      autoRetry: true,
      autoRetryTimeoutMs: 10000,
    });
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    // Allow the loader promise to reject
    await Promise.resolve();

    jest.advanceTimersByTime(5000);

    await Promise.resolve();

    expect(loader).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5000);

    await Promise.resolve();

    expect(loader).toHaveBeenCalledTimes(2);

    await promise;

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);

    jest.useRealTimers();
  });
});

describe('preloadLazyComponent', () => {
  it('allows to start loading a component before it renders', async () => {
    jest.useFakeTimers();

    const { loader } = aSuccessLoader(1000);

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    preloadLazyComponent(LazyComponent);

    jest.advanceTimersByTime(500);

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    jest.advanceTimersByTime(500);

    await promise;

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);

    jest.useRealTimers();
  });

  it('has no effect when called not with a lazy component', async () => {
    const Component: FC = () => <h1>hello</h1>;

    preloadLazyComponent(Component);
  });
});

describe('clearLazyComponentError', () => {
  it('has no effect before the component even starts loading', async () => {
    expect.assertions(1);

    const { loader, error } = anErrorLoader();

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    clearLazyComponentError(LazyComponent);

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    try {
      await promise;
    } catch (err) {}

    expect(() => LazyComponent(props)).toThrow(error);
  });

  it('has no effect after the component loaded successfully', async () => {
    const { loader } = aSuccessLoader();

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    await promise;

    clearLazyComponentError(LazyComponent);

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('clears the error if called after the component failed to load', async () => {
    expect.assertions(3);

    const { loader, error } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader);
    const props = { name: 'John' };

    let promise: Promise<any> | null = null;

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    try {
      await promise;
    } catch (err) {}

    expect(() => LazyComponent(props)).toThrow(error);

    clearLazyComponentError(LazyComponent);

    try {
      LazyComponent(props);
    } catch (value) {
      promise = value;
    }

    await promise;

    expect(LazyComponent(props)).toMatchInlineSnapshot(`
      <Name
        name="John"
      />
    `);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('has no effect when called not with a lazy component', async () => {
    const Component: FC = () => <h1>hello</h1>;

    clearLazyComponentError(Component);
  });
});
