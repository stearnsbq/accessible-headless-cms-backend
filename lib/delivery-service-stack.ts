import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface DeliveryProps extends cdk.StackProps{
  
}



export class DeliveryServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DeliveryProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AccessibleHeadlessCmsBackendQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
