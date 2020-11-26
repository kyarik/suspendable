# suspendable

`suspendable` is a set of utilities to create resources that can suspend in React.

Suspendable resources are meant to be used with React [`<Suspense>`](https://reactjs.org/docs/concurrent-mode-suspense.html) (added in React 16.6) to decleratively wait while they're loading and show a fallback.

When using a suspendable resource inside a React component, you can treat it as it already loaded - there's no need to check if it loaded or not yet because if it did not load when you try to use it, the React component will suspend and show the fallback of the nearest `<Suspense>` ancestor.

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
- [`lazyComponent`](#lazyComponent)
- [`ResourceOptions`](#ResourceOptions)

### `lazyResource`

```ts
lazyResource<T>(loader: () => Promise<T>, options?: ResourceOptions): Resource<T>
```

**Parameters**

- `loader` is the loader function to load a resource of type `T`. This is a regular function that returns a promise.

- `options?: ResourceOptions` are the [resource options](#ResourceOptions).

**Return value**

- `Resource<T>` a resource of type `T`.

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
- `React.lazy` will cache the promise returned by the loading function even if the promise rejects. So, it the component fails to load, there's no easy way to retry loading it. With `lazyComponent` this can be easily accomplished by calling `clearLazyComponentError` (or `clearResourceErrors`, which will clear errors for all resources that failed to load).

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
