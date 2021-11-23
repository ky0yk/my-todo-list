import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Task, TaskSummary, UpdateTaskInfo } from '../../utils/types';

// テーブル名のチェック
if (!process.env.TABLE_NAME) {
  throw new Error('テーブル名を取得できませんでした。');
}
const tableName = process.env.TABLE_NAME!;

export const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
export const ddbDocClient = ddbLib.DynamoDBDocumentClient.from(ddbClient);

export const createTask = async (taskInfo: Task): Promise<Task> => {
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

export const getTask = async (
  user: string,
  taskId?: string
): Promise<Task | undefined> => {
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
  if (!data.Item) {
    return undefined;
  } else {
    return data.Item as Task;
  }
};

export const getTasks = async (user: string): Promise<TaskSummary[]> => {
  const params: ddbLib.QueryCommandInput = {
    TableName: tableName,
    ExpressionAttributeNames: {
      '#user': 'user',
    },
    ExpressionAttributeValues: {
      ':u': user,
    },
    KeyConditionExpression: '#user = :u',
    ProjectionExpression: 'id, tittle, priority, completed',
  };
  const data: ddbLib.QueryCommandOutput = await ddbDocClient.send(
    new ddbLib.QueryCommand(params)
  );
  return data.Items as TaskSummary[];
};

export const updateTask = async (
  user: string,
  id: string,
  updateTaskInfo: UpdateTaskInfo
): Promise<Task> => {
  // クエリの組み立て
  const updateExpression = Object.keys(updateTaskInfo).map(
    (key) => `#att_${key} =:${key}`
  );
  const expressionAttributeNames = Object.fromEntries(
    Object.entries(updateTaskInfo).map(([k, v]) => [`#att_${k}`, k])
  );
  const expressionAttributeValues = Object.fromEntries(
    Object.entries(updateTaskInfo).map(([k, v]) => [`:${k}`, v])
  );
  // DynamoDBへの登録
  const params: ddbLib.UpdateCommandInput = {
    TableName: tableName,
    Key: {
      id: id,
      user: user,
    },
    UpdateExpression: `set ${updateExpression.join()}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };
  const result: ddbLib.UpdateCommandOutput = await ddbDocClient.send(
    new ddbLib.UpdateCommand(params)
  );
  return result.Attributes as Task;
};

export const deleteTask = async (user: string, id: string) => {
  const params: ddbLib.DeleteCommandInput = {
    TableName: tableName,
    Key: {
      id: id,
      user: user,
    },
    ReturnValues: 'ALL_OLD',
  };
  const result: ddbLib.DeleteCommandOutput = await ddbDocClient.send(
    new ddbLib.DeleteCommand(params)
  );
  return result.Attributes;
};
