import { mockClient } from 'aws-sdk-client-mock';
import * as ddbLib from '@aws-sdk/lib-dynamodb';
import * as infra from '../../../src/infrastructures/dynamodb/tasks-table';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../src/utils/types';

const tableName = process.env.TABLE_NAME;
const ddbMock = mockClient(infra.ddbDocClient);

/**
 * 担保できていること:
 * AWS SDKに渡されるパラメータが正しいこと
 * インフラ層の関数の戻り値が想定通りであること
 */

describe('インフラ', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  test('タスクが登録できること', async () => {
    const inputItem = {
      id: uuidv4(),
      user: '7d8ca528-4931-4254-9273-ea5ee853f271',
      tittle: 'コーヒー豆を買う',
      body: 'いつものコーヒーショップでブレンドを100g',
      priority: 1,
      completed: false,
    };
    ddbMock
      .on(ddbLib.PutCommand, {
        TableName: tableName,
        Item: inputItem,
      })
      .resolves({
        Attributes: inputItem,
      });
    const res: Task = await infra.createTask(inputItem);
    expect(res).toStrictEqual(inputItem);
  });
});
