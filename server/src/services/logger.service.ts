import { Tag } from '@core/provider';
import { Constructor } from '@core/types';

export const LOGGER = new Tag<Logger>('service/logger');

export class Logger {
  static of(prefix: string): Constructor<Logger> {
    return class {
      public log(message: string) {
        console.log(prefix, message);
      }
    };
  }

  public log(message: string) {
    console.log(message);
  }
}

export class SilentLogger implements Logger {
  public log(): void {}
}
