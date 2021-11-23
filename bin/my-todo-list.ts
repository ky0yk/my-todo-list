import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyTodoListStack } from '../lib/my-todo-list-stack';
import { ResourceName } from '../lib/resourceName';

// 環境名が指定されているかのチェック
if (!process.env.SYSTEM_ENV) {
  throw new Error('環境変数で環境名を指定してください。');
}

const systemEnv = process.env.SYSTEM_ENV!;
const resourceName = new ResourceName('MyTodoList', systemEnv);

const app = new cdk.App();

// 環境名ごとにpropsの内容を変更
const amplifyUrl = process.env.AMPLIFY_URL ? process.env.AMPLIFY_URL : '';
const frontendUrls = [amplifyUrl];
if (systemEnv === 'dev' || systemEnv === 'stg') {
  frontendUrls.push('http://localhost:3200');
}
const callbackAndLogoutUrls = frontendUrls.map(
  (url) => `${url}/oauth2-redirect.html`
);
const props = {
  frontendUrls: frontendUrls,
  callbackUrls: callbackAndLogoutUrls,
  logoutUrls: callbackAndLogoutUrls,
  domainPrefix: `my-todo-${systemEnv}`,
};

new MyTodoListStack(app, resourceName, props);
