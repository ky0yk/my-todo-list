import {
  expect as expectCDK,
  countResources,
  haveResource,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as todoApi from '../lib/my-todo-list-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = 'dev';
const resourceName = new ResourceName('MyTodoList', systemEnv);

const app = new cdk.App();
const stack = new todoApi.MyTodoListStack(app, resourceName, {
  callbackUrls: ['http://localhost:3200/oauth2-redirect.html'],
  logoutUrls: ['http://localhost:3200/oauth2-redirect.html'],
  frontendUrls: ['http://localhost:3200'],
  domainPrefix: process.env.DOMAIN_PREFIX!,
});

test('API Gateway', () => {
  expectCDK(stack).to(countResources('AWS::ApiGatewayV2::Api', 1));
  expectCDK(stack).to(
    haveResource('AWS::ApiGatewayV2::Api', {
      CorsConfiguration: {
        AllowHeaders: ['authorization', 'content-type'],
        AllowMethods: ['*'],
        AllowOrigins: ['http://localhost:3200'],
      },
      Name: 'MyTodoList-dev-todo-api',
      ProtocolType: 'HTTP',
    })
  );
});

test('Lambda', () => {
  expectCDK(stack).to(countResources('AWS::Lambda::Function', 1));
  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      FunctionName: 'MyTodoList-dev-todo-function',
      Handler: 'index.handler',
      Runtime: 'nodejs14.x',
      Environment: {
        Variables: {
          TABLE_NAME: 'MyTodoList-dev-todo-table',
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        },
      },
      Role: {
        'Fn::GetAtt': ['MyTodoListdevtodofunctionServiceRole3EC171A7', 'Arn'],
      },
    })
  );
});

test('IAM Role', () => {
  expectCDK(stack).to(countResources('AWS::IAM::Role', 1));
  expectCDK(stack).to(
    haveResource('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
          },
        ],
        Version: '2012-10-17',
      },
      ManagedPolicyArns: [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              {
                Ref: 'AWS::Partition',
              },
              ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            ],
          ],
        },
      ],
    })
  );
});

test('DynamoDB', () => {
  expectCDK(stack).to(countResources('AWS::DynamoDB::Table', 1));
  expectCDK(stack).to(
    haveResource('AWS::DynamoDB::Table', {
      KeySchema: [
        {
          AttributeName: 'user',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'id',
          KeyType: 'RANGE',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'user',
          AttributeType: 'S',
        },
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      TableName: 'MyTodoList-dev-todo-table',
    })
  );
});

test('Cognito UserPool', () => {
  expectCDK(stack).to(countResources('AWS::Cognito::UserPool', 1));
  expectCDK(stack).to(
    haveResource('AWS::Cognito::UserPool', {
      AccountRecoverySetting: {
        RecoveryMechanisms: [
          {
            Name: 'verified_email',
            Priority: 1,
          },
        ],
      },
      AdminCreateUserConfig: {
        AllowAdminCreateUserOnly: false,
      },
      AutoVerifiedAttributes: ['email'],
      EmailVerificationMessage:
        'The verification code to your new account is {####}',
      EmailVerificationSubject: 'Verify your new account',
      Schema: [
        {
          Mutable: true,
          Name: 'email',
          Required: true,
        },
      ],
      SmsVerificationMessage:
        'The verification code to your new account is {####}',
      UsernameAttributes: ['email'],
      UsernameConfiguration: {
        CaseSensitive: false,
      },
      UserPoolName: 'MyTodoList-dev-todo-user-pool',
      VerificationMessageTemplate: {
        DefaultEmailOption: 'CONFIRM_WITH_CODE',
        EmailMessage: 'The verification code to your new account is {####}',
        EmailSubject: 'Verify your new account',
        SmsMessage: 'The verification code to your new account is {####}',
      },
    })
  );
});
