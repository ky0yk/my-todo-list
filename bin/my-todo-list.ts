#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyTodoListStack } from '../lib/my-todo-list-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = process.env.SYSTEM_ENV ? process.env.SYSTEM_ENV : 'dev';
const resourceName = new ResourceName('MyTodoList', systemEnv);

const app = new cdk.App();
new MyTodoListStack(app, resourceName, {
  callbackUrls: [
    'http://localhost:3200/oauth2-redirect.html',
    'https://feature-amplify-console-swagger.d68k7gpg5sbd1.amplifyapp.com/oauth2-redirect.html',
  ],
  logoutUrls: [
    'http://localhost:3200/oauth2-redirect.html',
    'https://feature-amplify-console-swagger.d68k7gpg5sbd1.amplifyapp.com/oauth2-redirect.html',
  ],
  frontendUrls: [
    'http://localhost:3200',
    'https://feature-amplify-console-swagger.d68k7gpg5sbd1.amplifyapp.com',
  ],
  domainPrefix: process.env.DOMAIN_PREFIX!,
});
