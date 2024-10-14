export type Constructor<T> = {
  new (): T;
};

export type Unionize<T extends any[], Acc = never> = T extends []
  ? Acc
  : T extends [infer U, ...infer Rest]
    ? Unionize<Rest, Acc | U>
    : never;

export type GetAt<N extends number, T extends Array<[unknown, unknown]>, Acc extends unknown[] = []> = T extends []
  ? Acc
  : T extends [infer U, ...infer Rest]
    ? U extends unknown[]
      ? U[N] extends () => infer X
        ? Rest extends Array<[unknown, unknown]>
          ? GetAt<N, Rest, [...Acc, X]>
          : never
        : never
      : never
    : never;

export interface IRunnable {
  run: () => Promise<void>;
}

export interface IStoppable {
  stop: () => Promise<void>;
}
