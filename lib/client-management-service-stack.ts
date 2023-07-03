import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ClientManagementProps extends cdk.StackProps{
  
}


export class ClientManagementServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ClientManagementProps) {
    super(scope, id, props);







  }
}
