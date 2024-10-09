import { Context } from '@core/context';
import { Tag } from '@core/provider';
import type { Todo } from '@server/entities/todo';
import { TODO_REPO } from '@server/repositories/todo';

export interface ITodoService {
  get(id: string): Promise<Todo>;
  getAll(projectId: string): Promise<Todo[]>;
  create(projectId: string, data: Pick<Todo, 'description' | 'dueBy' | 'done'>): Promise<Todo>;
  update(id: string, data: Pick<Todo, 'description' | 'dueBy'>): Promise<Todo>;
  setDone(todoId: string, done: boolean): Promise<Todo>;
}

export const TODO_SRV = new Tag<ITodoService>('service/todo');

export class TodoService implements ITodoService {
  private todoRepository = Context.get(TODO_REPO);

  get(id: string): Promise<Todo> {
    return this.todoRepository.get(id);
  }

  getAll(projectId: string): Promise<Todo[]> {
    return this.todoRepository.getAll({ project: false }, { projectId });
  }

  create(projectId: string, data: Pick<Todo, 'description' | 'dueBy' | 'done'>): Promise<Todo> {
    return this.todoRepository.create({ projectId, ...data });
  }

  update(id: string, data: Pick<Todo, 'description' | 'dueBy'>): Promise<Todo> {
    return this.todoRepository.update(id, data);
  }

  setDone(todoId: string, done: boolean): Promise<Todo> {
    return this.todoRepository.update(todoId, { done });
  }
}
