import { Context } from '@core/context';
import { Tag } from '@core/provider';
import { PROJECT_REPO } from '@server/repositories/project';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';
import { TODO_SRV } from './todo.service';

export interface IProjectService {
  get(id: string): Promise<Project & { todos: Todo[] }>;
  getAll(): Promise<(Project & { todos: Todo[] })[]>;
  create(data: Pick<Project, 'name'>): Promise<Project>;
  update(id: string, data: Pick<Project, 'name'>): Promise<Project>;
  archive(id: string): Promise<Project>;
  restore(id: string): Promise<Project>;
}

export const PROJECT_SRV = new Tag<IProjectService>('service/project');

export class ProjectService implements IProjectService {
  private projectRepository = Context.get(PROJECT_REPO);

  get(id: string): Promise<Project & { todos: Todo[] }> {
    return this.projectRepository.get(id, { todos: true });
  }

  getAll(): Promise<(Project & { todos: Todo[] })[]> {
    return this.projectRepository.getAll({ todos: true });
  }

  create(data: Pick<Project, 'name'>): Promise<Project> {
    return this.projectRepository.create({ name: data.name });
  }

  update(id: string, data: Pick<Project, 'name'>): Promise<Project> {
    return this.projectRepository.update(id, { name: data.name });
  }

  archive(id: string): Promise<Project> {
    return this.projectRepository.update(id, { archived: true });
  }

  restore(id: string): Promise<Project> {
    return this.projectRepository.update(id, { archived: false });
  }
}
