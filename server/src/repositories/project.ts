import { Tag } from '@core/provider';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';

export interface IProjectRepository {
  get(id: string): Promise<Project>;
  get(id: string, includes: { todos: false }): Promise<Project>;
  get(id: string, includes: { todos: true }): Promise<Project & { todos: Todo[] }>;

  getAll(): Promise<Project[]>;
  getAll(includes: { todos: false }): Promise<Project[]>;
  getAll(includes: { todos: true }): Promise<(Project & { todos: Todo[] })[]>;

  create(data: Pick<Project, 'name'> & Partial<Pick<Project, 'archived'>>): Promise<Project>;
  update(id: string, data: Partial<Pick<Project, 'name' | 'archived'>>): Promise<Project>;
  delete(id: string): Promise<boolean>;
}

export const PROJECT_REPO = new Tag<IProjectRepository>('repository/project');
