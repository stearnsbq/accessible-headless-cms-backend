import * as cdk from 'aws-cdk-lib';
import { AuthorizationType, Authorizer, CognitoUserPoolsAuthorizer, LambdaIntegration, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ManagementProps extends cdk.StackProps{
  projectTable: Table;
  userTable: Table;
  modelTable: Table;
  contentTable: Table;
  managementToolUserPool: UserPool;
}


export class ManagementServiceStack extends cdk.Stack {
  public readonly MANAGEMENT_SERVICE_DIR = join(__dirname, 'microservices', 'ManagementService')
  constructor(scope: Construct, id: string, props: ManagementProps) {
    super(scope, id, props);



    const createProjectFn = new Function(this, `${id}-createProject`, {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/createProject')),
      handler: 'createProject.handler',
    })

    props.projectTable.grantReadWriteData(createProjectFn);

    const authorizer = new CognitoUserPoolsAuthorizer(this, `${id}-managementToolAuthorizer`, {
      cognitoUserPools: [props.managementToolUserPool]
    })

    const authProps = {authorizer, authorizationType: AuthorizationType.COGNITO}

    const managementAPI = new RestApi(this, `${id}-managementAPI`);

    const projectResource = managementAPI.root.addResource("project")

    projectResource.addCorsPreflight({
      allowMethods: ['POST', 'GET'],
      allowOrigins: [
        '*',
      ],
   })
    
    projectResource.addMethod('POST', new LambdaIntegration(createProjectFn))

  }
}
