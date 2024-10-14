import { Constructor } from '@core/types';

declare const tag: unique symbol;

/**
 * @name Tag
 * @description A wrapper class for injectable dependencies.
 */
export class Tag<T> {
  private [tag]!: T;
  constructor(public name: string) {}
}

/**
 * @name ValueProvider
 * @description Defines a specialized provider for constant values.
 */
export class ValueProvider<T> {
  constructor(public value: T) {}
}

/**
 * @name FactoryProvider
 * @description Defines a specialized provider for factory functions.
 */
export class FactoryProvider<T> {
  constructor(public factory: () => T) {}
}

/**
 * @name Provider
 * @description A generic type for all kinds of providers.
 */
export type Provider<T> = Constructor<T> | ValueProvider<T> | FactoryProvider<T>;

type ProvideFn = {
  <T, U extends T>(tag: Tag<T>, provider: Constructor<U>): [Tag<T>, () => U];
  <T, U extends T>(tag: Tag<T>, provider: { value: T }): [Tag<T>, () => U];
  <T, U extends T>(tag: Tag<T>, provider: { factory: () => T }): [Tag<T>, () => U];
};

const isFactory = <T>(provider: Provider<T>): provider is FactoryProvider<T> => {
  return !!(provider as any).factory;
};

const isValue = <T>(provider: Provider<T>): provider is ValueProvider<T> => {
  return !!(provider as any).value;
};

/**
 * @name provide
 * @description Creates a strongly typed `[Tag, Provider]` 2-tuple.
 */
export const provide: ProvideFn = (tag, provider) => {
  if (isFactory(provider)) return [tag, provider.factory];
  if (isValue(provider)) return [tag, () => provider.value];
  return [tag, () => new provider()];
};
