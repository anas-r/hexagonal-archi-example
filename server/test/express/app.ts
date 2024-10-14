import express from 'express';
import supertest from 'supertest';
import { Context } from '@core/context';
import { provide, ValueProvider } from '@core/provider';
import { AppModule, EXPRESS_CONFIG, EXPRESS_APP } from '@server/adapters/express';
import { PROJECT_EXP_ADAPT, ProjectExpressAdapter } from '@server/adapters/express/project.adapter';
import { TODO_EXP_ADAPT, TodoExpressAdapter } from '@server/adapters/express/todo.adapter';
import { MockProjectRepository } from '@server/repositories/mock/project.repository';
import { MockTodoRepository } from '@server/repositories/mock/todo.repository';
import { PROJECT_REPO } from '@server/repositories/project';
import { TODO_REPO } from '@server/repositories/todo';
import { PROJECT_SRV, ProjectService } from '@server/services/project.service';
import { TODO_SRV, TodoService } from '@server/services/todo.service';
import { LOGGER, SilentLogger } from '@server/services/logger.service';
import type { Project } from '@server/entities/project';

export const createTestModule = () =>
  Context.provide(
    AppModule,
    Context.create(
      provide(TODO_REPO, MockTodoRepository),
      provide(PROJECT_REPO, MockProjectRepository),
      provide(TODO_SRV, TodoService),
      provide(PROJECT_SRV, ProjectService),
      provide(TODO_EXP_ADAPT, TodoExpressAdapter),
      provide(PROJECT_EXP_ADAPT, ProjectExpressAdapter),
      provide(EXPRESS_CONFIG, new ValueProvider({ port: 6666, scheme: 'http', host: 'localhost' })),
      provide(EXPRESS_APP, new ValueProvider(express())),
      provide(LOGGER, SilentLogger)
    )
  );

export const createProject = (appModule: AppModule): Promise<Project> =>
  supertest(appModule.app)
    .post('/projects')
    .send({ name: 'Mock project' })
    .then((res) => res.body);
