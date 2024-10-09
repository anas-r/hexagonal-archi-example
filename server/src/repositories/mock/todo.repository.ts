import { MockDB } from '@server/repositories/mock/mock.db';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';
import type { ITodoRepository } from '@server/repositories/todo';

let currentId = -1;

export class MockTodoNotFoundError extends Error {}
export class MockTodoProjectNotFoundError extends Error {}

export class MockTodoRepository implements ITodoRepository {
  get(id: string): Promise<Todo>;
  get(id: string, includes: { project: false }): Promise<Todo>;
  get(id: string, includes: { project: true }): Promise<Todo & { project: Project }>;
  async get(id: string, includes?: { project: boolean }): Promise<Todo | (Todo & { project: Project })> {
    if (!MockDB.todos.has(id)) throw new MockTodoNotFoundError();

    const mapper = includes?.project
      ? (todo: Todo) => ({ ...todo, project: MockDB.projects.get(todo.projectId)! })
      : (todo: Todo) => todo;

    const todo = MockDB.todos.get(id)!;
    return mapper(todo);
  }

  getAll(): Promise<Todo[]>;
  getAll(includes: { project: false }): Promise<Todo[]>;
  getAll(includes: { project: true }): Promise<(Todo & { project: Project })[]>;
  getAll(includes: { project: false }, where: { projectId: string }): Promise<Todo[]>;
  getAll(includes: { project: true }, where: { projectId: string }): Promise<(Todo & { project: Project })[]>;
  async getAll(
    includes?: { project: boolean },
    where?: { projectId: string }
  ): Promise<Todo[] | (Todo & { project: Project })[]> {
    const todos = Array.from(MockDB.todos.values());

    const filter = where ? (todo: Todo) => todo.projectId === where.projectId : (todo: Todo) => true;
    const mapper = includes?.project
      ? (todo: Todo) => ({ ...todo, project: MockDB.projects.get(todo.projectId)! })
      : (todo: Todo) => todo;

    return todos.filter(filter).map(mapper);
  }

  async create(data: Pick<Todo, 'projectId'> & Partial<Pick<Todo, 'description' | 'dueBy' | 'done'>>): Promise<Todo> {
    if (!MockDB.projects.has(data.projectId)) throw new MockTodoProjectNotFoundError();

    const id = (currentId += 1).toString();
    const todo: Todo = {
      id,
      projectId: data.projectId,
      done: data.done || false,
      description: data.description || null,
      dueBy: data.dueBy || null,
    };

    const todoIdsByProjectId = MockDB.$index.todoIdsByProjectId.get(data.projectId) || [];
    const updatedTodoIdsByProjectId = [...todoIdsByProjectId, id];
    MockDB.$index.todoIdsByProjectId.set(data.projectId, updatedTodoIdsByProjectId);

    MockDB.todos.set(id, todo);
    return todo;
  }

  async update(id: string, data: Partial<Pick<Todo, 'description' | 'dueBy' | 'done'>>): Promise<Todo> {
    if (!MockDB.todos.has(id)) throw new MockTodoNotFoundError();
    const oldTodo = MockDB.todos.get(id)!;
    const todo: Todo = {
      id: oldTodo.id,
      projectId: oldTodo.projectId,
      done: data.done !== undefined ? data.done : oldTodo.done,
      description: data.description !== undefined ? data.description : oldTodo.description,
      dueBy: data.dueBy !== undefined ? data.dueBy : oldTodo.dueBy,
    };

    MockDB.todos.set(id, todo);
    return todo;
  }

  async delete(id: string): Promise<boolean> {
    if (!MockDB.todos.has(id)) false;

    const todo = MockDB.todos.get(id)!;
    const todoIdsByProjectId = MockDB.$index.todoIdsByProjectId.get(todo.projectId) || [];
    const updatedTodoIdsByProjectId = todoIdsByProjectId.filter((todoId) => todoId !== todo.id);
    MockDB.$index.todoIdsByProjectId.set(todo.projectId, updatedTodoIdsByProjectId);

    MockDB.todos.delete(id);
    return true;
  }
}
