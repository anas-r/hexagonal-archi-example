import type { Tag } from '@core/provider';
import type { Constructor, GetAt, Unionize } from '@core/types';

declare const provided: unique symbol;

let currentStore: Map<Tag<unknown>, unknown> | null = null;

/**
 * @name ContextUndefinedError
 */
export class ContextUndefinedError extends Error {}

/**
 * @name ContextTagNotProvidedError
 */
export class ContextTagNotProvidedError<T> extends Error {
  constructor(tag: Tag<T>) {
    super(`Tag: ${tag.name}`);
  }
}

/**
 * @name Context
 * @description A wrapper class for multiple injectable dependencies.
 */
export class Context<P> {
  private [provided]!: P;
  private ctors: Map<Tag<unknown>, () => unknown> = new Map();
  private instances: Map<Tag<unknown>, unknown> = new Map();

  private static _verbose = !!process.env.VERBOSE_DI;

  private static log(...messages: unknown[]) {
    if (!this._verbose) return;
    console.log('[DI]', ...messages);
  }

  /**
   * @description Creates a placeholder for injectable dependencies to be later resolved.
   * @see {@link Tag}
   */
  static get<T>(tag: Tag<T>): T {
    if (!currentStore) throw new ContextUndefinedError();
    if (!currentStore.has(tag)) throw new ContextTagNotProvidedError(tag);
    return currentStore.get(tag) as T;
  }

  /**
   * @description Creates a context.
   */
  static create<TProviders extends Array<[Tag<unknown>, () => unknown]>>(
    ...providers: TProviders
  ): Context<Unionize<GetAt<1, TProviders>>> {
    Context.log('Context.create');
    const context = new Context<Unionize<GetAt<1, TProviders>>>();
    for (const [tag, getter] of providers) {
      context.ctors.set(tag, getter);
    }

    return context;
  }

  /**
   * @description Instanciates an object with resolved dependencies.
   */
  static provide<T, P>(ctor: Constructor<T>, context: Context<P>): T {
    Context.log('Context.provide');
    if (currentStore) throw new ContextUndefinedError();
    currentStore = context.instances;
    for (const [tag, getter] of context.ctors) {
      Context.log('Context.provide:', 'constructing', tag.name);
      context.instances.set(tag, getter());
    }

    const instance = new ctor();
    currentStore = null;
    return instance;
  }
}
