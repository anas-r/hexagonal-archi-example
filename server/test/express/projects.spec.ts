import supertest from 'supertest';
import { createTestModule } from '@test/express/app';
import type { AppModule } from '@server/adapters/express';
import type { Project } from '@server/entities/project';
import type { Todo } from '@server/entities/todo';

describe('# projects', () => {
  let appModule: AppModule;
  let project: Project;
  let todo: Todo;
  let todo2: Todo;

  beforeAll(async () => {
    appModule = createTestModule();
    await appModule.run();
  });

  afterAll(async () => {
    await appModule.stop();
  });

  test('POST / - 201', async () => {
    const res = await supertest(appModule.app).post('/projects').send({ name: 'Test project' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test project', archived: false });

    project = res.body;
  });

  test('POST / - 500 when no name', async () => {
    const res = await supertest(appModule.app).post('/projects').send({});
    expect(res.status).toBe(500);
  });

  test('POST / - 500 when name is null', async () => {
    const res = await supertest(appModule.app).post('/projects').send({ name: null });
    expect(res.status).toBe(500);
  });

  test('GET /', async () => {
    const res = await supertest(appModule.app).get('/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: project.id, name: 'Test project', archived: false, todos: [] }]);
  });

  test('GET /:id', async () => {
    const res = await supertest(appModule.app).get(`/projects/${project.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: project.id, name: 'Test project', archived: false, todos: [] });
  });

  test('GET /:id - 500 when no project not found', async () => {
    const res = await supertest(appModule.app).get(`/projects/999`);
    expect(res.status).toBe(500);
  });

  test('PUT /:id', async () => {
    const res = await supertest(appModule.app).put(`/projects/${project.id}`).send({ name: 'Test project updated' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: project.id, name: 'Test project updated', archived: false });
  });

  test('DELETE /:id', async () => {
    const res = await supertest(appModule.app).delete(`/projects/${project.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: project.id, name: 'Test project updated', archived: true });
  });

  test('POST /:id', async () => {
    const res = await supertest(appModule.app).post(`/projects/${project.id}`);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: project.id, name: 'Test project updated', archived: false });
  });

  test('POST /:id/todos - 201', async () => {
    const dueBy = new Date();
    const res = await supertest(appModule.app)
      .post(`/projects/${project.id}/todos`)
      .send({ description: 'Todo description', dueBy, done: false });

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

  test('POST /:id/todos - 500 when project not found', async () => {
    const dueBy = new Date();
    const res = await supertest(appModule.app)
      .post(`/projects/999/todos`)
      .send({ description: 'Todo description', dueBy, done: false });

    expect(res.status).toBe(500);
  });

  test('GET / - 200 when multiple todos', async () => {
    todo2 = await supertest(appModule.app)
      .post(`/projects/${project.id}/todos`)
      .then((res) => res.body);

    const res = await supertest(appModule.app).get('/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: project.id,
        name: 'Test project updated',
        archived: false,
        todos: expect.arrayContaining([
          {
            id: todo.id,
            projectId: project.id,
            description: 'Todo description',
            dueBy: expect.any(String),
            done: false,
          },
          {
            id: todo2.id,
            projectId: project.id,
            description: null,
            dueBy: null,
            done: false,
          },
        ]),
      },
    ]);
  });

  test('GET /:id/todos', async () => {
    const res = await supertest(appModule.app).get(`/projects/${project.id}/todos`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([todo, todo2]));
  });
});
