import bodyParser from 'body-parser';
import { Context } from '@core/context';
import { IRunnable, IStoppable } from '@core/types';
import { Tag } from '@core/provider';
import { LOGGER } from '@server/services/logger.service';
import * as projectAdapter from '@server/adapters/express/project.adapter';
import * as todoAdapter from '@server/adapters/express/todo.adapter';
import type { IncomingMessage, Server, ServerResponse } from 'http';
import type { Application } from 'express';

export class AppModule implements IRunnable, IStoppable {
  private _app = Context.get(EXPRESS_APP);
  private logger = Context.get(LOGGER);
  private config = Context.get(EXPRESS_CONFIG);

  private server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;

  constructor() {
    this._app.use(bodyParser.json());
    projectAdapter.mount();
    todoAdapter.mount();
  }

  get app() {
    return this._app;
  }

  async run() {
    this.server = this._app
      .listen(this.config.port, () =>
        this.logger.log(`App is running on ${this.config.scheme}://${this.config.host}:${this.config.port}`)
      )
      .on('error', () => this.server!.close());
  }

  async stop() {
    if (this.server) this.server.close();
  }
}

export class ExpressConfig {
  constructor(
    public port: number,
    public scheme: string,
    public host: string
  ) {}
}

export const EXPRESS_APP = new Tag<Application>('express/app');
export const EXPRESS_CONFIG = new Tag<ExpressConfig>('express/config');
