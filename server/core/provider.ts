import { Constructor } from '@core/types';

declare const tag: unique symbol;

const VALUE = Symbol('VALUE');
const FACTORY = Symbol('FACTORY');

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
  private [VALUE]: T;
  constructor(public value: T) {
    this[VALUE] = value;
  }
}

/**
 * @name FactoryProvider
 * @description Defines a specialized provider for factory functions.
 */
export class FactoryProvider<T> {
  private [FACTORY]: () => T;
  constructor(public factory: () => T) {
    this[FACTORY] = factory;
  }
}

/**
 * @name Provider
 * @description A generic type for all kinds of providers.
 */
export type Provider<T> = Constructor<T> | ValueProvider<T> | FactoryProvider<T>;

type ProvideFn = {
  <T, U extends T>(tag: Tag<T>, provider: Constructor<U>): [Tag<T>, () => U];
  <T, U extends T>(tag: Tag<T>, provider: ValueProvider<T>): [Tag<T>, () => U];
  <T, U extends T>(tag: Tag<T>, provider: FactoryProvider<T>): [Tag<T>, () => U];
};

const isFactory = <T>(provider: Provider<T>): provider is FactoryProvider<T> => {
  return Reflect.has(provider, FACTORY);
};

const isValue = <T>(provider: Provider<T>): provider is ValueProvider<T> => {
  return Reflect.has(provider, VALUE);
};

/**
 * @name provide
 * @description Creates a strongly typed `[Tag, Provider]` 2-tuple.
 */
export const provide: ProvideFn = (tag, provider) => {
  if (isFactory(provider)) return [tag, Reflect.get(provider, FACTORY)];
  if (isValue(provider)) return [tag, () => Reflect.get(provider, VALUE)];
  return [tag, () => new provider()];
};
