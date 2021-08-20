import React, { Suspense, useCallback } from 'react';
import type { ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clearLazyComponentError, lazyComponent, preloadLazyComponent } from '..';
import type { Loader } from '../../types';
import { act } from 'react-dom/test-utils';

const aSuccessLoader = ({ delayMs }: { delayMs: number } = { delayMs: 0 }) => {
  const Name = ({ name }: { name: string }) => <h1>{name}</h1>;

  const result = { default: Name };

  const loader = jest.fn(
    () =>
      new Promise<typeof result>((resolve) => {
        setTimeout(() => {
          resolve(result);
        }, delayMs);
      }),
  );

  return {
    result,
    loader,
  };
};

const anErrorLoader = () => {
  const error = new Error('Failed to load');
  const promise = Promise.reject(error);
  const loader: Loader<{ default: ComponentType<{ name: string }> }> = jest.fn(() => promise);

  return {
    error,
    loader,
  };
};

const anErrorThenSuccessLoader = () => {
  const Name = ({ name }: { name: string }) => <h1>{name}</h1>;

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

jest.useFakeTimers();

afterEach(() => {
  act(() => {
    jest.runAllTimers();
  });
});

describe('lazyComponent', () => {
  it('returns a lazy component that suspends while loading', async () => {
    const { loader } = aSuccessLoader();

    const LazyComponent = lazyComponent(loader);

    render(
      <Suspense fallback="Loading...">
        <LazyComponent name="John" />
      </Suspense>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeNull();
    });
  });

  it('returns a lazy component that throws an error if it fails to load', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const { error, loader } = anErrorLoader();

    const LazyComponent = lazyComponent(loader);

    render(
      // eslint-disable-next-line react/jsx-no-bind
      <ErrorBoundary fallbackRender={(props) => <p>{props.error.message}</p>}>
        <Suspense fallback="Loading...">
          <LazyComponent name="John" />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    await waitFor(() => {
      expect(screen.queryByText(error.message)).not.toBeNull();
    });

    spy.mockRestore();
  });

  it('auto-retries loading the component after 3 seconds if autoRetry is true and the promise rejects', async () => {
    const { loader } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader, { autoRetry: true });

    render(
      <Suspense fallback="Loading...">
        <LazyComponent name="John" />
      </Suspense>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    // Let the rejected promise be handled
    await act(() => Promise.resolve());

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Loading...')).not.toBeNull();

    expect(loader).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Let the loader be called again
    await act(() => Promise.resolve());

    expect(loader).toHaveBeenCalledTimes(2);

    // Let the resolved promise be handled
    await act(() => Promise.resolve());

    expect(screen.queryByText('John')).not.toBeNull();
  });

  it('auto-retries calling the loader if autoRetry is true, respecting the autoRetryTimeoutMs', async () => {
    const { loader } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader, {
      autoRetry: true,
      autoRetryTimeoutMs: 10000,
    });

    render(
      <Suspense fallback="Loading...">
        <LazyComponent name="John" />
      </Suspense>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    // Let the rejected promise be handled
    await act(() => Promise.resolve());

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Loading...')).not.toBeNull();

    expect(loader).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Let the loader be called again
    await act(() => Promise.resolve());

    expect(loader).toHaveBeenCalledTimes(2);

    // Let the resolved promise be handled
    await act(() => Promise.resolve());

    expect(screen.queryByText('John')).not.toBeNull();
  });
});

describe('preloadLazyComponent', () => {
  it('allows to start loading a component before it renders', async () => {
    const { loader } = aSuccessLoader({ delayMs: 1000 });

    const LazyComponent = lazyComponent(loader);

    preloadLazyComponent(LazyComponent);

    jest.advanceTimersByTime(500);

    render(
      <Suspense fallback="Loading...">
        <LazyComponent name="John" />
      </Suspense>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Let the resolved promise be handled
    await act(() => Promise.resolve());
    await act(() => Promise.resolve());

    expect(screen.queryByText('John')).not.toBeNull();
  });

  it('has no effect when called not with a lazy component', () => {
    const Component = () => <h1>hello</h1>;

    expect(() => {
      preloadLazyComponent(Component);
    }).not.toThrow();
  });
});

describe('clearLazyComponentError', () => {
  it('has no effect before the component even starts loading', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const { error, loader } = anErrorLoader();

    const LazyComponent = lazyComponent(loader);

    clearLazyComponentError(LazyComponent);

    render(
      // eslint-disable-next-line react/jsx-no-bind
      <ErrorBoundary fallbackRender={(props) => <p>{props.error.message}</p>}>
        <Suspense fallback="Loading...">
          <LazyComponent name="John" />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Loading...')).not.toBeNull();

    await waitFor(() => {
      expect(screen.queryByText(error.message)).not.toBeNull();
    });

    spy.mockRestore();
  });

  it('has no effect after the component loaded successfully', async () => {
    const { loader } = aSuccessLoader();

    const LazyComponent = lazyComponent(loader);

    render(
      <Suspense fallback="Loading...">
        <LazyComponent name="John" />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeNull();
    });

    clearLazyComponentError(LazyComponent);

    expect(screen.queryByText('John')).not.toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('clears the error if called after the component failed to load', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const { loader, error } = anErrorThenSuccessLoader();

    const LazyComponent = lazyComponent(loader);

    const ErrorFallback = ({ error: { message }, resetErrorBoundary }: FallbackProps) => {
      const handleReset = useCallback(() => {
        clearLazyComponentError(LazyComponent);
        resetErrorBoundary();
      }, [resetErrorBoundary]);

      return (
        <div>
          <p>{message}</p>
          <button onClick={handleReset} type="button">
            Try again
          </button>
        </div>
      );
    };

    render(
      // eslint-disable-next-line react/jsx-no-bind
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback="Loading...">
          <LazyComponent name="John" />
        </Suspense>
      </ErrorBoundary>,
    );

    await waitFor(() => {
      expect(screen.queryByText(error.message)).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /try again/iu }));

    expect(screen.queryByText('Loading...')).not.toBeNull();

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeNull();
    });

    expect(loader).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  it('has no effect when called not with a lazy component', () => {
    const Component = () => <h1>hello</h1>;

    expect(() => {
      clearLazyComponentError(Component);
    }).not.toThrow();
  });
});
