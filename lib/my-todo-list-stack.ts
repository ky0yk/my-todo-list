import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resourceName';

export class MyTodoListStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    resourceName: ResourceName,
    props?: cdk.StackProps
  ) {
    const id = resourceName.stackName('App');
    super(scope, id, props);

    // Lambda

    // Dynamo DB

    // API Gateway

    // Cognito
  }
}
