# suspendable

`suspendable` is a set of utilities to create resources that can suspend in React.

Suspendable resources are meant to be used with React [`<Suspense>`](https://reactjs.org/docs/concurrent-mode-suspense.html) (added in React 16.6) to decleratively wait while they're loading and show a fallback.

When using a suspendable resource inside a React component, you can treat it as it already loaded - there's no need to check if it loaded or not because if it did not load when you try to use it, the React component will suspend and show the fallback of the nearest `<Suspense>` ancestor.

## Installation

Using yarn:

```
yarn add suspendable
```

Using npm:

```
npm install suspendable
```

## API

- [`lazyResource`](#lazyResource)
- [`clearResourceErrors`](#clearResourceErrors)
- [`lazyComponent`](#lazyComponent)
- [`preloadLazyComponent`](#preloadLazyComponent)
- [`clearLazyComponentError`](#clearLazyComponentError)
- [`Resource`](#Resource)
- [`ResourceOptions`](#ResourceOptions)

### `lazyResource`

```ts
lazyResource<T>(loader: () => Promise<T>, options?: ResourceOptions): Resource<T>
```

**Parameters**

- `loader` is the loader function to load a resource of type `T`. This is a regular function that returns a promise.

- `options?: ResourceOptions` are the [resource options](#ResourceOptions).

**Return value**

- `Resource<T>` a [resource](#Resource) of type `T`.

**Description**

`lazyResource` is used to create a lazy resource. It's lazy because it will not start loading the resource immediately. Instead, it will start loading it only when the `load` method is called. The resource can be read at any point inside a React component - if it has not loaded at the time it is called, the component will suspend.

**Example**

```ts
const resource = lazyResource(() => import('./data.json'), { autoRetry: true });

// start loading it at some point later
resource.load();

// read it inside a React component
resource.read();
```

### `clearResourceErrors`

```ts
clearResourceErrors(): void
```

**Description**

`clearResourceErrors` clears the errors for all resources that failed to load. This means that all those resource can retry loading by calling the `Resource#load()` method.

### `lazyComponent`

```ts
lazyComponent<P>(loader: () => Promise<{ default: ComponentType<P> }>, options?: ResourceOptions): ComponentType<P>
```

**Parameters**

- `loader` is the loader function to load a React component. This is a function that returns a dynamic import. The component should be the default export of the module that is dynamically imported.

- `options?: ResourceOptions` are the [resource options](#ResourceOptions).

**Return value**

- `ComponentType<P>` a lazy React component that accepts exactly the same props as the component being dynamically imported.

**Description**

`lazyComponent` is a wrapper around `lazyResource` that is used to create a lazy React component. It's lazy because it will not start loading the original component immediately. Instead, it will start loading it only when the component is being rendered or when `preloadLazyComponent` is called. The component can be rendered at any point; if it has not loaded at the time it is rendered, it will suspend.

`lazyComponent` is very similar to [`React.lazy`](https://reactjs.org/docs/code-splitting.html#reactlazy), but has a few key differences:

- `React.lazy` will start loading the component when it is rendered. There is no easy way to start loading it earlier. `lazyComponent` returns a lazy component that can start loading even before being rendered (by calling `preloadLazyComponent`).
- `lazyComponent` accepts options that allow to auto-retry loading the component in case it fails to load the first time.
- `React.lazy` will cache the promise returned by the loader function even if the promise rejects. So, it the component fails to load, there's no easy way to retry loading it. With `lazyComponent` this can be easily accomplished by calling `clearLazyComponentError` (or `clearResourceErrors`, which will clear errors for all resources that failed to load).

**Example**

```tsx
const LazyWidget = lazyComponent(() => import('./components/Widget'), {
  autoRetry: true,
});

// optionally start preloading it at any point
preloadLazyComponent(LazyWidget);

// render it at any point
return <LazyWidget {...widgetProps} />;
```

### `preloadLazyComponent`

```ts
preloadLazyComponent(LazyComponent: ComponentType<any>): void
```

**Parameters**

- `LazyComponent` the lazy component returned by `lazyComponent` that we want to preload.

**Description**

`preloadLazyComponent` preloads a lazy component, i.e., starts loading the lazy component even before it is rendered. Good places where to start preloading a component are the router and event handlers. Under the hood, this function is just calling `Resource#load()` for the component resource, which means that it is idempotent - calling it after the first time has no effect. However, If the component fails to load and `clearLazyComponentError` is called (or `clearResourceErrors`), then calling this method will again begin loading the component.

### `clearLazyComponentError`

```ts
clearLazyComponentError(LazyComponent: ComponentType<any>): void
```

**Parameters**

- `LazyComponent` the lazy component returned by `lazyComponent` for which we want to clear the error.

**Description**

`clearLazyComponentError` clears the error for a lazy component that failed to load. This allows rendering the component again and calling `preloadLazyComponent` to retry loading the component. This function has no effect if the component is still loading or if it already loaded successfully.

### `Resource`

```ts
interface Resource<T> {
  clearError: () => void;
  get: () => T | null;
  load: () => Promise<T>;
  read: () => T;
}
```

- `clearError: () => void` clears the error in case the resource failed to load. This allows to call the load method again and retry loading the resource. This method has no effect if the resource is still loading or if it already loaded successfully.

- `get: () => T | null` returns the loaded resource or `null` if the resource is still loading, if it failed to load, or if it didn't even start loading yet.

- `load: () => Promise<T>` begins loading the resource by calling the provided loader function. This method is idempotent - calling it after the first time has no effect. However, If the resource fails to load and `Resource#clearError()` is called (or `clearResourceErrors`), then calling this method will again begin loading the resource.

- `read: () => T` returns the loaded resource. If the resource is still loading when this method is called, it will throw the resource promise, which will make the React component suspend and show the fallback of the nearest `<Suspense>` ancestor. If the resource failed to load, then this method will throw the error with which the promise rejected, causing the nearest error boundary ancestor to be hit. This method must be called inside a React component and it can only be called after the resource started loading with `Resource#load()`.

### `ResourceOptions`

```ts
interface ResourceOptions {
  autoRetry?: boolean;
  autoRetryTimeoutMs?: number;
}
```

- `autoRetry?: boolean` (default `false`) specifies whether to retry loading the resource if it fails to load the first time. When set to `true` and the promise returned by the loader function rejects, it will wait `autoRetryTimeoutMs` milliseconds and call the loader again. It will keep doing this until the promise returned by the loader resolves.

- `autoRetryTimeoutMs?: number` (default `3000`) the number of milliseconds to wait before retrying calling the loader after the promise that the loader previosly returned rejects. This option is applicable only when `autoRetry` is set to `true`.

## Prior art

This library was inspired by `JSResource` as defined [here](https://github.com/relayjs/relay-examples/blob/master/issue-tracker/src/JSResource.js).

## Contributing

Pull requests are very welcome. If you intend to introduce a major change, please open a related issue first in which we can discuss what you would like to change.

Please make sure to update the tests and the README as appropriate.

## License

[MIT](https://github.com/kyarik/suspendable/blob/master/LICENSE)
