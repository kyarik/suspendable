# suspendable

`suspendable` is a set of utilities to create suspendable resources in React.

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

### `lazyResource`

```ts
lazyResource<T>(loader: () => Promise<T>, options?: ResourceOptions): Resource<T>
```

#### Parameters

- `loader` is the loader function to load a resource of type `T`. This is a regular function that returns a promise.

- `options?: ResourceOptions` are the resource options.

#### Return value

- `Resource<T>` a resource of type `T`.

#### Description

`lazyResource` is used to create a lazy resource. It's lazy because it will not start loading the resource immediately. Instead, it will start loading it only when the `load` method is called. The resource can be read at any point inside a React component - if it has not loaded at the time it is called, the component will suspend.

#### Example

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

#### Parameters

- `loader` is the loader function to load a React component. This is a function that returns a dynamic import. The component should be the default export of the module that is dynamically imported.

- `options?: ResourceOptions` are the resource options.

#### Return value

- `ComponentType<P>` a lazy React component that accepts exactly the same props as the component being dynamically imported.

#### Description

`lazyComponent` is a wrapper around `lazyResource` that is used to create a lazy React component. It's lazy because it will not start loading the original component immediately. Instead, it will start loading it only when the component is being rendered or when `preloadLazyComponent` is called. The component can be rendered at any point; if it has not loaded at the time it is rendered, it will suspend.

`lazyComponent` is very similar to `React.lazy`, but has a few key differences:

- `React.lazy` will start loading the component when it is rendered. There is no easy way to start loading it earlier. `lazyComponent` returns a lazy component that can start loading even before being rendered (by calling `preloadLazyComponent`).
- `lazyComponent` accepts options that allow to auto-retry loading the component in case it fails to load the first time.
- `React.lazy` will cache the promise returned by the loading function even if the promise rejects. So, it the component fails to load, there's no easy way to retry loading it. With `lazyComponent` this can be easily accomplished by calling `clearLazyComponentError` (or `clearResourceErrors`, which will clear errors for all resources that failed to load).

#### Example

```tsx
const LazyWidget = lazyComponent(() => import('./components/Widget'), {
  autoRetry: true,
});

// optionally start preloading it at any point
preloadLazyComponent(LazyComponent);

// render it at any point
return <LazyComponent {...props} />;
```

## Prior art

This library was inspired by `JSResource` as defined [here](https://github.com/relayjs/relay-examples/blob/master/issue-tracker/src/JSResource.js).

## Contributing

Pull requests are very welcome. If you intend to introduce a major change, please open a related issue first in which we can discuss what you would like to change.

Please make sure to update the tests and the README as appropriate.

## License

[MIT](https://github.com/kyarik/suspendable/blob/master/LICENSE)
