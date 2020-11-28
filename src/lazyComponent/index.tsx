import React, { ComponentType } from 'react';
import { lazyResource } from '../lazyResource';
import { Resource, ResourceOptions } from '../types';

const componentResources = new WeakMap<
  ComponentType<any>,
  Resource<{ default: ComponentType<any> }>
>();

/**
 * Creates a lazy React component. It's lazy because it will not start loading
 * the original component immediately. Instead, it will start loading it only
 * when the component is being rendered or when `preloadLazyComponent` is
 * called. The component can be rendered at any point; if it has not loaded at
 * the time it is rendered, it will suspend.
 * @param loader the loader function to load a React component. This is a
 *    function that returns a dynamic import. The component should be the default
 *    export of the module that is dynamically imported.
 * @param options the resource options.
 * @returns a lazy React component that accepts exactly the same props as the
 *    component being dynamically imported.
 */
export const lazyComponent = <P extends {} = {}>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: ResourceOptions,
) => {
  const resource = lazyResource(loader, options);

  const LazyComponent = (props: P) => {
    resource.load();

    const { default: Component } = resource.read();

    return <Component {...props} />;
  };

  componentResources.set(LazyComponent, resource);

  return LazyComponent;
};

/**
 * Preloads a lazy component, i.e., starts loading the lazy component even
 * before it is rendered. Good places where to start preloading a component are
 * the router and event handlers. Under the hood, this function is just calling
 * `Resource#load()` for the component resource, which means that it is
 * idempotent - calling it after the first time has no effect. However, If the
 * component fails to load and `clearLazyComponentError` is called (or
 * `clearResourceErrors`), then calling this method will again begin loading
 * the component.
 * @param LazyComponent the lazy component returned by `lazyComponent` that we
 *    want to preload.
 */
export const preloadLazyComponent = (LazyComponent: ComponentType<any>) => {
  const resource = componentResources.get(LazyComponent);

  if (!resource) {
    return;
  }

  resource.load();
};

/**
 * Clears the error for a lazy component that failed to load. This allows
 * rendering the component again and calling `preloadLazyComponent` to retry
 * loading the component. This function has no effect if the component is still
 * loading or if it already loaded successfully.
 * @param LazyComponent the lazy component returned by `lazyComponent` for which
 *    we want to clear the error.
 */
export const clearLazyComponentError = (LazyComponent: ComponentType<any>) => {
  const resource = componentResources.get(LazyComponent);

  if (!resource) {
    return;
  }

  resource.clearError();
};
