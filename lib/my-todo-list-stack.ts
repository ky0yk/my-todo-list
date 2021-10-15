import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resourceName';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class MyTodoListStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    resourceName: ResourceName,
    props?: cdk.StackProps
  ) {
    const id = resourceName.stackName('App');
    super(scope, id, props);

    // Dynamo DB
    const todoTableName = resourceName.dynamodbName('todo');
    const todoTable = new dynamodb.Table(this, todoTableName, {
      tableName: todoTableName,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'todoId', type: dynamodb.AttributeType.STRING },
    });

    // Lambda
    const todoFunctionName = resourceName.lambdaName('todo');
    const todoFunction = new NodejsFunction(this, todoFunctionName, {
      functionName: todoFunctionName,
      entry: 'src/lambda/handlers/index.ts',
      environment: {
        TABLE_NAME: todoTableName,
      },
    });

    todoTable.grantReadWriteData(todoFunction);

    // API Gateway

    // Cognito
  }
}
