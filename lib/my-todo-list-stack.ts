import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ResourceName } from './resourceName';

export interface ApigwWithCognitoStackProps extends cdk.StackProps {
  callbackUrls: string[];
  logoutUrls: string[];
  frontendUrls: string[];
  domainPrefix: string;
}

export class MyTodoListStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    resourceName: ResourceName,
    props: ApigwWithCognitoStackProps
  ) {
    const id = resourceName.stackName('App');
    super(scope, id, props);

    // Dynamo DB
    const tableName = resourceName.dynamodbName('todo');
    const table = new dynamodb.Table(this, tableName, {
      tableName: tableName,
      partitionKey: { name: 'user', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Lambda
    const handlerName = resourceName.lambdaName('todo');
    const handler = new NodejsFunction(this, handlerName, {
      functionName: handlerName,
      entry: 'src/handlers/index.ts',
      environment: {
        TABLE_NAME: tableName,
      },
    });

    table.grantReadWriteData(handler);

    // Cognito
    const userPoolName = resourceName.userPoolName('todo');
    const userPool = new cognito.UserPool(this, userPoolName, {
      userPoolName: userPoolName,
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
    userPool.addDomain('domain', {
      cognitoDomain: { domainPrefix: props.domainPrefix },
    });

    const userPoolClientName = resourceName.userPoolClientName('todo');
    const userPoolClient = userPool.addClient(userPoolClientName, {
      oAuth: {
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: props.callbackUrls,
        logoutUrls: props.logoutUrls,
        flows: { authorizationCodeGrant: true },
      },
      userPoolClientName: userPoolClientName,
      // generateSecret: false,
      // authFlows: {
      //   adminUserPassword: true,
      // },
      // preventUserExistenceErrors: true,
    });

    // API Gateway
    const authorizer = new HttpUserPoolAuthorizer({
      authorizerName: 'cognito-authorizer',
      userPool: userPool,
      userPoolClient: userPoolClient,
    });

    const httpApiName = resourceName.apiName('todo');
    const httpApi = new HttpApi(this, httpApiName, {
      apiName: httpApiName,
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowOrigins: props.frontendUrls,
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowHeaders: ['authorization', 'content-type'],
      },
    });
    httpApi.addRoutes({
      methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
      path: '/tasks',
      integration: new LambdaProxyIntegration({ handler: handler }),
    });
    httpApi.addRoutes({
      methods: [
        apigw.HttpMethod.GET,
        apigw.HttpMethod.PUT,
        apigw.HttpMethod.DELETE,
      ],
      path: '/tasks/{id}',
      integration: new LambdaProxyIntegration({ handler: handler }),
    });

    // Cfn Output
    new cdk.CfnOutput(this, 'userPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'OutputApiUrl', { value: httpApi.url! });
  }
}
