import express from 'express';
import { Context } from '@core/context';
import { Tag } from '@core/provider';
import { TODO_SRV } from '@server/services/todo.service';
import type { Application, Request, Response } from 'express';
import type { Todo } from '@server/entities/todo';

export const TODO_EXP_ADAPT = new Tag<TodoExpressAdapter>('express/adapter/todo');

export class TodoBadRequestError extends Error {}

export class TodoExpressAdapter {
  private todoService = Context.get(TODO_SRV);

  async create(
    req: Request<{}, {}, Pick<Todo, 'projectId' | 'description' | 'dueBy' | 'done'>>,
    res: Response<Todo>
  ): Promise<void> {
    const { projectId, description, dueBy, done } = req.body;
    if (!projectId) {
      throw new TodoBadRequestError();
    }

    const todo = await this.todoService.create(projectId, { description, dueBy, done });
    res.status(201).json(todo);
  }

  async get(req: Request<{ id: string }>, res: Response<Todo>): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new TodoBadRequestError();
    }

    const todo = await this.todoService.get(id);
    res.json(todo);
  }

  async update(
    req: Request<{ id: string }, {}, Pick<Todo, 'description' | 'dueBy'>>,
    res: Response<Todo>
  ): Promise<void> {
    const { id } = req.params;
    const { description, dueBy } = req.body;
    if (!id) {
      throw new TodoBadRequestError();
    }

    const todo = await this.todoService.update(id, { description, dueBy });
    res.json(todo);
  }

  async check(req: Request<{ id: string }>, res: Response<Todo>): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new TodoBadRequestError();
    }

    const todo = await this.todoService.setDone(id, true);
    res.status(201).json(todo);
  }

  async uncheck(req: Request<{ id: string }>, res: Response<Todo>): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new TodoBadRequestError();
    }

    const todo = await this.todoService.setDone(id, false);
    res.json(todo);
  }
}

export const mount = (app: Application) => {
  const adapter = Context.get(TODO_EXP_ADAPT);
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    try {
      await adapter.create(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      await adapter.get(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      await adapter.update(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.post('/:id', async (req, res, next) => {
    try {
      await adapter.check(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await adapter.uncheck(req, res);
    } catch (e) {
      next(e);
    }
  });

  app.use('/todos', router);
  return app;
};
