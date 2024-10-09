import { Tag } from '@core/provider';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';

export interface ITodoRepository {
  get(id: string): Promise<Todo>;
  get(id: string, includes: { project: false }): Promise<Todo>;
  get(id: string, includes: { project: true }): Promise<Todo & { project: Project }>;

  getAll(): Promise<Todo[]>;
  getAll(includes: { project: false }): Promise<Todo[]>;
  getAll(includes: { project: true }): Promise<(Todo & { project: Project })[]>;
  getAll(includes: { project: false }, where: { projectId: string }): Promise<Todo[]>;
  getAll(includes: { project: true }, where: { projectId: string }): Promise<(Todo & { project: Project })[]>;

  create(data: Pick<Todo, 'projectId'> & Partial<Pick<Todo, 'description' | 'dueBy' | 'done'>>): Promise<Todo>;
  update(id: string, data: Partial<Pick<Todo, 'description' | 'dueBy' | 'done'>>): Promise<Todo>;
  delete(id: string): Promise<boolean>;
}

export const TODO_REPO = new Tag<ITodoRepository>('repository/todo');
