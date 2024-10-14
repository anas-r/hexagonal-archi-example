import supertest from 'supertest';
import { createProject, createTestModule } from '@test/express/app';
import type { AppModule } from '@server/adapters/express';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';

describe('# todos', () => {
  let appModule: AppModule;
  let project: Project;
  let todo: Todo;
  let todo2: Todo;

  beforeAll(async () => {
    appModule = createTestModule();
    await appModule.run();

    project = await createProject(appModule);
  });

  afterAll(async () => {
    await appModule.stop();
  });

  test('POST / - 201', async () => {
    const dueBy = new Date();
    const res = await supertest(appModule.app)
      .post('/todos')
      .send({ projectId: project.id, name: 'todo', description: 'Todo description', dueBy, done: false });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      projectId: project.id,
      description: 'Todo description',
      dueBy: dueBy.toISOString(),
      done: false,
    });

    todo = res.body;
  });

  test('POST / - 201 when missing optional fields', async () => {
    const res = await supertest(appModule.app).post('/todos').send({ projectId: project.id });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      projectId: project.id,
      description: null,
      dueBy: null,
      done: false,
    });

    todo2 = res.body;
  });

  test('POST / - 500 when project not found', async () => {
    const res = await supertest(appModule.app).post('/todos').send({ projectId: 999 });
    expect(res.status).toBe(500);
  });

  test('GET /:id - 200', async () => {
    const res = await supertest(appModule.app).get(`/todos/${todo.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(todo);
  });

  test('GET /:id - 500 when todo not found', async () => {
    const res = await supertest(appModule.app).get(`/todos/999`);
    expect(res.status).toBe(500);
  });

  test('PUT /:id - 200', async () => {
    const dueBy = new Date('2024-12-12');
    const res = await supertest(appModule.app)
      .put(`/todos/${todo.id}`)
      .send({ description: 'Updated description', dueBy });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: todo.id,
      projectId: project.id,
      description: 'Updated description',
      done: false,
      dueBy: dueBy.toISOString(),
    });

    todo = res.body;
  });

  test('POST /:id - 200', async () => {
    const res = await supertest(appModule.app).post(`/todos/${todo.id}`);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: todo.id,
      projectId: project.id,
      description: 'Updated description',
      done: true,
      dueBy: todo.dueBy,
    });
  });

  test('DELETE /:id - 200', async () => {
    const res = await supertest(appModule.app).delete(`/todos/${todo.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: todo.id,
      projectId: project.id,
      description: 'Updated description',
      done: false,
      dueBy: todo.dueBy,
    });
  });
});
