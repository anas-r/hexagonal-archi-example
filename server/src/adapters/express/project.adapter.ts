import express from 'express';
import { Context } from '@core/context';
import { Tag } from '@core/provider';
import { PROJECT_SRV } from '@server/services/project.service';
import { TODO_SRV } from '@server/services/todo.service';
import { EXPRESS_APP } from '@server/adapters/express';
import type { Request, Response } from 'express';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';

export const PROJECT_EXP_ADAPT = new Tag<ProjectExpressAdapter>('express/adapter/project');

export class ProjectBadRequestError extends Error {}

export class ProjectExpressAdapter {
  private todoService = Context.get(TODO_SRV);
  private projectService = Context.get(PROJECT_SRV);

  async getAll(req: Request, res: Response<(Project & { todos: Todo[] })[]>): Promise<void> {
    const projects = await this.projectService.getAll();
    res.json(projects);
  }

  async create(req: Request<{}, {}, Pick<Project, 'name'>>, res: Response<Project>): Promise<void> {
    const name = req.body?.name;
    if (!name) {
      throw new ProjectBadRequestError();
    }

    const project = await this.projectService.create({ name });
    res.status(201).json(project);
  }

  async get(req: Request<{ id: string }>, res: Response<Project & { todos: Todo[] }>): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ProjectBadRequestError();
    }

    const project = await this.projectService.get(id);
    res.json(project);
  }

  async update(req: Request<{ id: string }, {}, Pick<Project, 'name'>>, res: Response<Project>): Promise<void> {
    const id = req.params.id;
    const name = req.body.name;
    if (!id || !name) {
      throw new ProjectBadRequestError();
    }

    const project = await this.projectService.update(id, { name });
    res.json(project);
  }

  async archive(req: Request<{ id: string }>, res: Response<Project>): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ProjectBadRequestError();
    }

    const project = await this.projectService.archive(id);
    res.json(project);
  }

  async restore(req: Request<{ id: string }>, res: Response<Project>): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ProjectBadRequestError();
    }

    const project = await this.projectService.restore(id);
    res.status(201).json(project);
  }

  async createTodo(
    req: Request<{ id: string }, {}, Pick<Todo, 'description' | 'done'> & { dueBy: string }>,
    res: Response<Todo>
  ): Promise<void> {
    const projectId = req.params.id;
    if (!projectId) {
      throw new ProjectBadRequestError();
    }

    const dueBy = req.body.dueBy ? new Date(req.body.dueBy) : null;
    const todos = await this.todoService.create(projectId, { ...req.body, dueBy });
    res.status(201).json(todos);
  }

  async getTodos(req: Request<{ id: string }>, res: Response<Todo[]>): Promise<void> {
    const projectId = req.params.id;
    if (!projectId) {
      throw new ProjectBadRequestError();
    }

    const todos = await this.todoService.getAll(projectId);
    res.json(todos);
  }
}

export const mount = () => {
  const app = Context.get(EXPRESS_APP);
  const adapter = Context.get(PROJECT_EXP_ADAPT);
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      await adapter.getAll(req, res);
    } catch (e) {
      next(e);
    }
  });

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

  router.delete('/:id', async (req, res, next) => {
    try {
      await adapter.archive(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.post('/:id', async (req, res, next) => {
    try {
      await adapter.restore(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.post('/:id/todos', async (req, res, next) => {
    try {
      await adapter.createTodo(req, res);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id/todos', async (req, res, next) => {
    try {
      await adapter.getTodos(req, res);
    } catch (e) {
      next(e);
    }
  });

  app.use('/projects', router);
  return app;
};
