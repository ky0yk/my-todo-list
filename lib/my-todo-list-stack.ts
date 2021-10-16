import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resourceName';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';

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

    // Cognito
    const userPool = new cognito.UserPool(this, 'todoUserPool', {
      userPoolName: 'todoUserPool',
      selfSignUpEnabled: true,
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      signInCaseSensitive: false,
      autoVerify: { email: true },
      signInAliases: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient('client', {
      userPoolClientName: 'cognito-cli',
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
      },
      preventUserExistenceErrors: true,
    });

    // API Gateway
  }
}
