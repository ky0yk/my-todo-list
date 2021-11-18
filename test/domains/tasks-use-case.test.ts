import * as http from 'http';
import request = require('supertest');
const app = require('../../src/handlers/app');
import * as infra from '../../src/infrastructures/dynamodb/tasks-table';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateTaskInfo,
  Task,
  TaskSummary,
  UpdateTaskInfo,
} from '../../src/utils/types';
import { cognitoJwtGenerator } from './cognitoJwtGenerator';
import jwtDecode, { JwtPayload } from 'jwt-decode';

jest.mock('../../src/infrastructures/dynamodb/tasks-table');

/**
 * 担保できていること:
 * ドメイン層の関数の戻り値が想定通りであること
 * ドメイン層の関数に紐づくインフラ層の関数が一度だけ呼ばれること
 * ドメイン層の関数に紐づくインフラ層の関数に渡されるパラメータが正しいこと
 *
 * 担保できていないこと:
 * リクエストされたパスに紐づくドメイン層の関数が呼ばれること
 */

describe('ユースケース', () => {
  let server: http.Server;
  beforeEach(() => {
    server = app.listen(3000);
  });
  afterEach(() => {
    server.close();
  });

  test('ヘルスチェックAPIが利用できる', async () => {
    const res: request.Response = await request(server).get('/');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ message: 'API is working!' });
  });

  test('タスクの登録ができること', async () => {
    const token = cognitoJwtGenerator('test-user');
    const inputItem: CreateTaskInfo = {
      tittle: 'コーヒー豆を買う',
      body: 'いつものコーヒーショップでブレンドを100g',
      priority: 1,
    };
    const expectedItem: Task = {
      tittle: 'コーヒー豆を買う',
      body: 'いつものコーヒーショップでブレンドを100g',
      priority: 1,
      id: expect.anything(), // idは自動生成のためanythingを利用
      user: '7d8ca528-4931-4254-9273-ea5ee853f271',
      completed: false,
      createdAt: expect.anything(), // モックを叩く際にcreatedAt, updatedAtが自動生成されるためanythingを利用
      updatedAt: expect.anything(),
    };
    const createTaskMock = (infra.createTask as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .post(`/tasks`)
      .set('authorization', token)
      .send(inputItem);
    expect(createTaskMock.mock.calls.length).toBe(1);
    console.log(createTaskMock.mock.calls[0][0]);
    expect(createTaskMock.mock.calls[0][0]).toEqual(expectedItem);
    expect(res.status).toEqual(201);
    expect(res.body).toEqual(expectedItem);
  });

  test('タスク一覧の取得ができること', async () => {
    const token = cognitoJwtGenerator('test-user');
    const user: string = '7d8ca528-4931-4254-9273-ea5ee853f271';

    const expectedItem: TaskSummary[] = [
      {
        tittle: 'コーヒー豆を買う',
        priority: 1,
        id: '4e469469-2745-4f9d-a7b4-f59b67b54bee',
        completed: false,
      },
      {
        tittle: 'ドーナッツを買う',
        priority: 1,
        id: '492b0f4a-9017-4b08-be43-a89d545863eb',
        completed: false,
      },
    ];
    const getTaskMock = (infra.getTasks as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .get(`/tasks`)
      .set('authorization', token)
      .send();
    expect(getTaskMock.mock.calls.length).toBe(1);
    expect(getTaskMock.mock.calls[0][0]).toEqual(user); // userの確認
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('タスク詳細の取得ができること', async () => {
    const token = cognitoJwtGenerator('test-user');
    const inputId: string = '4e469469-2745-4f9d-a7b4-f59b67b54bee';
    const user: string = '7d8ca528-4931-4254-9273-ea5ee853f271';

    const expectedItem: Task = {
      tittle: 'コーヒー豆を買う',
      body: 'いつものコーヒーショップでブレンドを100g',
      priority: 1,
      user: '7d8ca528-4931-4254-9273-ea5ee853f271',
      createdAt: '2021-11-01T12:31:18.023Z',
      updatedAt: '2021-11-01T12:31:18.023Z',
      id: '4e469469-2745-4f9d-a7b4-f59b67b54bee',
      completed: false,
    };
    const getTaskMock = (infra.getTask as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .get(`/tasks/${inputId}`)
      .set('authorization', token)
      .send();
    expect(getTaskMock.mock.calls.length).toBe(1);
    expect(getTaskMock.mock.calls[0][0]).toEqual(user); // userの確認
    expect(getTaskMock.mock.calls[0][1]).toEqual(inputId); // idの確認
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('タスクのが更新できること', async () => {
    const token = cognitoJwtGenerator('test-user');
    const inputId: string = '4e469469-2745-4f9d-a7b4-f59b67b54bee';
    const user: string = '7d8ca528-4931-4254-9273-ea5ee853f271';

    const inputItem: UpdateTaskInfo = {
      tittle: 'コーヒー豆を買う',
      body: 'いつものコーヒーショップでブレンドを100g',
      priority: 2,
      completed: true,
      updatedAt: expect.anything(),
    };
    const expectedItem = {
      id: inputId,
      user: user,
      ...inputItem,
    };
    const updateTaskMock = (infra.updateTask as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .put(`/tasks/${inputId}`)
      .set('authorization', token)
      .send(inputItem);
    expect(updateTaskMock.mock.calls.length).toBe(1);
    expect(updateTaskMock.mock.calls[0][0]).toEqual(user);
    expect(updateTaskMock.mock.calls[0][1]).toEqual(inputId);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('タスクの削除ができること', async () => {
    const token = cognitoJwtGenerator('test-user');
    const inputId: string = '4e469469-2745-4f9d-a7b4-f59b67b54bee';
    const user: string = '7d8ca528-4931-4254-9273-ea5ee853f271';

    const expectedItem = {
      id: inputId,
      user: user,
    };
    const deleteTaskMock = (infra.deleteTask as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .delete(`/tasks/${inputId}`)
      .set('authorization', token)
      .send();
    expect(deleteTaskMock.mock.calls.length).toBe(1);
    expect(deleteTaskMock.mock.calls[0][0]).toEqual(user);
    expect(deleteTaskMock.mock.calls[0][1]).toEqual(inputId);
    expect(res.status).toEqual(204);
    expect(res.body).toEqual({});
  });
});
