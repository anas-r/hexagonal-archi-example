import bodyParser from 'body-parser';
import { Context } from '@core/context';
import { IRunnable, IStoppable } from '@core/types';
import { Tag } from '@core/provider';
import * as ProjectController from './project.adapter';
import * as TodoController from './todo.adapter';
import { Constructor } from '@core/types';
import type { IncomingMessage, Server, ServerResponse } from 'http';
import type { Application } from 'express';

export class AppModule implements IRunnable, IStoppable {
  private _app = Context.get(EXPRESS_APP);
  private config = Context.get(EXPRESS_CONFIG);

  private _server: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;

  constructor() {
    this._app.use(bodyParser.json());
    ProjectController.mount(this._app);
    TodoController.mount(this._app);
  }

  get app() {
    return this._app;
  }

  async run() {
    this._server = this._app.listen(this.config.port, () =>
      console.log(`App is running on ${this.config.scheme}://${this.config.host}:${this.config.port}`)
    );

    this._server.on('error', () => this._server!.close());
  }

  async stop() {
    if (this._server) this._server.close();
  }
}

interface IExpressConfig {
  port: number;
  scheme: string;
  host: string;
}

export class ExpressConfig {
  static of = (config: Partial<IExpressConfig>): Constructor<IExpressConfig> =>
    class {
      port = config.port || 3000;
      scheme = config.scheme || 'http';
      host = config.host || 'localhost';
    };
}

export const EXPRESS_APP = new Tag<Application>('express/app');
export const EXPRESS_CONFIG = new Tag<IExpressConfig>('express/config');
