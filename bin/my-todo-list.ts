#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyTodoListStack } from '../lib/my-todo-list-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = process.env.SYSTEM_ENV ? process.env.SYSTEM_ENV : 'dev';
const resourceName = new ResourceName('MyTodoList', systemEnv);

const app = new cdk.App();
new MyTodoListStack(app, resourceName);
