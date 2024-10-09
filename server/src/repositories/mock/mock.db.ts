import { Project } from '@server/entities/project';
import { Todo } from '@server/entities/todo';

export class MockDB {
  static todos = new Map<string, Todo>();
  static projects = new Map<string, Project>();

  static $index = Object.freeze({
    todoIdsByProjectId: new Map<string, string[]>(),
  });
}
