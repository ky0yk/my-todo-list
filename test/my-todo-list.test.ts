import {
  expect as expectCDK,
  countResources,
  haveResource,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as todoApi from '../lib/my-todo-list-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = process.env.SYSTEM_ENV ? process.env.SYSTEM_ENV : 'dev';
const resourceName = new ResourceName('todo', systemEnv);

const app = new cdk.App();
const stack = new todoApi.MyTodoListStack(app, resourceName, {
  callbackUrls: ['http://localhost:3200/oauth2-redirect.html'],
  logoutUrls: ['http://localhost:3200/oauth2-redirect.html'],
  frontendUrls: ['http://localhost:3200'],
  domainPrefix: process.env.DOMAIN_PREFIX!,
});

test('API Gateway', () => {
  expectCDK(stack).to(countResources('AWS::ApiGatewayV2::Api', 1));
});

test('Lambda', () => {
  expectCDK(stack).to(countResources('AWS::Lambda::Function', 1));
});

test('IAM Role', () => {
  expectCDK(stack).to(countResources('AWS::IAM::Role', 1));
});

test('DynamoDB', () => {
  expectCDK(stack).to(countResources('AWS::DynamoDB::Table', 1));
});

test('Cognito UserPool', () => {
  expectCDK(stack).to(countResources('AWS::Cognito::UserPool', 1));
});
