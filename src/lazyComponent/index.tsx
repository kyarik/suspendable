import React, { ComponentType } from 'react';
import { lazyResource } from '../lazyResource';
import { Resource, ResourceOptions } from '../types';

const componentResources = new WeakMap<
  ComponentType<any>,
  Resource<{ default: ComponentType<any> }>
>();

export const lazyComponent = <P extends {} = {}>(
  componentLoader: () => Promise<{ default: ComponentType<P> }>,
  options?: ResourceOptions,
) => {
  const resource = lazyResource(componentLoader, options);

  const LazyComponent = (props: P) => {
    resource.load();

    const { default: Component } = resource.read();

    return <Component {...props} />;
  };

  componentResources.set(LazyComponent, resource);

  return LazyComponent;
};

export const preloadLazyComponent = (LazyComponent: ComponentType<any>) => {
  const resource = componentResources.get(LazyComponent);

  if (!resource) {
    return;
  }

  resource.load();
};

export const clearLazyComponentError = (LazyComponent: ComponentType<any>) => {
  const resource = componentResources.get(LazyComponent);

  if (!resource) {
    return;
  }

  resource.clearError();
};
