import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../utils/types';

const tableName: string | undefined = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('テーブル名を取得できませんでした。');
}
export const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
export const ddbDocClient = ddbLib.DynamoDBDocumentClient.from(ddbClient);

export const createTask = async (taskInfo: Task): Promise<Task> => {
  // UUIDの付与
  taskInfo.id = uuidv4();
  // DynamoDBへの登録
  const params: ddbLib.PutCommandInput = {
    TableName: tableName,
    Item: taskInfo,
  };
  const data: ddbLib.PutCommandOutput = await ddbDocClient.send(
    new ddbLib.PutCommand(params)
  );
  return taskInfo;
};

export const getTask = async (user: string, taskId: string): Promise<Task> => {
  const params: ddbLib.GetCommandInput = {
    TableName: tableName,
    Key: {
      user: user,
      id: taskId,
    },
  };
  const data: ddbLib.GetCommandOutput = await ddbDocClient.send(
    new ddbLib.GetCommand(params)
  );
  return data.Item as Task;
};
