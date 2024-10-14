import express from 'express';
import { Context } from '@core/context';
import { provide, ValueProvider } from '@core/provider';
import { EXPRESS_CONFIG, AppModule, EXPRESS_APP } from '@adapters/express';
import { PROJECT_EXP_ADAPT, ProjectExpressAdapter } from '@adapters/express/project.adapter';
import { TODO_EXP_ADAPT, TodoExpressAdapter } from '@adapters/express/todo.adapter';
import { PROJECT_SRV, ProjectService } from '@services/project.service';
import { TODO_SRV, TodoService } from '@services/todo.service';
import { MockProjectRepository } from '@server/repositories/mock/project.repository';
import { TODO_REPO } from '@server/repositories/todo';
import { PROJECT_REPO } from '@server/repositories/project';
import { MockTodoRepository } from '@server/repositories/mock/todo.repository';
import { Logger, LOGGER } from '@services/logger.service';

Context.provide(
  AppModule,
  Context.create(
    provide(TODO_REPO, MockTodoRepository),
    provide(PROJECT_REPO, MockProjectRepository),
    provide(TODO_SRV, TodoService),
    provide(PROJECT_SRV, ProjectService),
    provide(TODO_EXP_ADAPT, TodoExpressAdapter),
    provide(PROJECT_EXP_ADAPT, ProjectExpressAdapter),
    provide(EXPRESS_CONFIG, new ValueProvider({ port: 2000, scheme: 'http', host: 'localhost' })),
    provide(EXPRESS_APP, new ValueProvider(express())),
    provide(LOGGER, Logger.of('[live]'))
  )
).run();
