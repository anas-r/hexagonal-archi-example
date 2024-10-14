import { Context } from '@core/context';
import { Tag } from '@core/provider';
import { TODO_REPO } from '@server/repositories/todo';
import type { Todo } from '@server/entities/todo';

export const TODO_SRV = new Tag<TodoService>('service/todo');

export class TodoService {
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
