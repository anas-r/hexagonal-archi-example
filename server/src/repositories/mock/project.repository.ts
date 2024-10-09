import { MockDB } from '@server/repositories/mock/mock.db';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';
import type { IProjectRepository } from '@server/repositories/project';

let currentId = -1;

export class MockProjectNotFoundError extends Error {}

export class MockProjectRepository implements IProjectRepository {
  get(id: string): Promise<Project>;
  get(id: string, includes: { todos: false }): Promise<Project>;
  get(id: string, includes: { todos: true }): Promise<Project & { todos: Todo[] }>;
  async get(id: string, includes?: { todos: boolean }): Promise<Project | (Project & { todos: Todo[] })> {
    if (!MockDB.projects.has(id)) throw new MockProjectNotFoundError();

    const project = MockDB.projects.get(id)!;

    const mapper = includes?.todos
      ? (project: Project) => {
          const todoIds = MockDB.$index.todoIdsByProjectId.get(project.id) || [];
          const todos = todoIds.map((todoId) => MockDB.todos.get(todoId)!);
          return { ...project, todos };
        }
      : (project: Project) => project;

    return mapper(project);
  }

  getAll(): Promise<Project[]>;
  getAll(includes: { todos: false }): Promise<Project[]>;
  getAll(includes: { todos: true }): Promise<(Project & { todos: Todo[] })[]>;
  async getAll(includes?: { todos: boolean }): Promise<Project[] | Array<Project & { todos: Todo[] }>> {
    const projects = Array.from(MockDB.projects.values());

    const mapper = includes?.todos
      ? (project: Project) => {
          const todoIds = MockDB.$index.todoIdsByProjectId.get(project.id) || [];
          const todos = todoIds.map((todoId) => MockDB.todos.get(todoId)!);
          return { ...project, todos };
        }
      : (project: Project) => project;

    return projects.map(mapper);
  }

  async create(data: Pick<Project, 'name'> & Partial<Pick<Project, 'archived'>>): Promise<Project> {
    const id = (currentId += 1).toString();
    const project: Project = {
      id,
      name: data.name,
      archived: data.archived || false,
    };

    MockDB.projects.set(id, project);
    return project;
  }

  async update(id: string, data: Partial<Pick<Project, 'name' | 'archived'>>): Promise<Project> {
    if (!MockDB.projects.has(id)) throw new MockProjectNotFoundError();
    const oldProject = MockDB.projects.get(id)!;
    const project: Project = {
      id: oldProject.id,
      name: data.name !== undefined ? data.name : oldProject.name,
      archived: data.archived !== undefined ? data.archived : oldProject.archived,
    };

    MockDB.projects.set(id, project);
    return project;
  }

  async delete(id: string): Promise<boolean> {
    if (!MockDB.projects.has(id)) false;
    MockDB.projects.delete(id);
    return true;
  }
}
