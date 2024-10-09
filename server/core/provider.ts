import { Constructor } from '@core/types';

declare const tag: unique symbol;

export class Tag<T> {
  private [tag]!: T;
  constructor(public name: string) {}
}

export class ValueProvider<T> {
  constructor(public value: T) {}
}

export class FactoryProvider<T> {
  constructor(public factory: () => T) {}
}

export type Provider<T> = Constructor<T> | ValueProvider<T> | FactoryProvider<T>;
export type ProvideFn = {
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

export const provide: ProvideFn = (tag, provider) => {
  if (isFactory(provider)) return [tag, provider.factory];
  if (isValue(provider)) return [tag, () => provider.value];
  return [tag, () => new provider()];
};
