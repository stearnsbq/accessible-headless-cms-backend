import * as cdk from 'aws-cdk-lib';
import { Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ManagementProps extends cdk.StackProps{
  projectTable: Table;
  userTable: Table;
  modelTable: Table;
  contentTable: Table;
  managementToolUserPool: UserPool;
}


export class ManagementServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ManagementProps) {
    super(scope, id, props);

    

    const managementAPI = new RestApi(this, `${id}-managementAPI`);



  }
}
