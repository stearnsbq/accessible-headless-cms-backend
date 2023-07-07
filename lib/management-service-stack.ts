import * as cdk from 'aws-cdk-lib';
import { AuthorizationType, Authorizer, CfnAuthorizer, CognitoUserPoolsAuthorizer, LambdaIntegration, MethodOptions, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
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
  public readonly MANAGEMENT_SERVICE_DIR = join('microservices', 'ManagementService')
  constructor(scope: Construct, id: string, props: ManagementProps) {
    super(scope, id, props);



    const createProjectFn = new Function(this, `${id}-createProject`, {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/createProject')),
      handler: 'createProject.handler',
      environment: {
        PROJECTS_TABLE: props.projectTable.tableName
      }
    })

    props.projectTable.grantReadWriteData(createProjectFn);

    const getProjectsFn = new Function(this, `${id}-getProjects`, {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/getProjects')),
      handler: 'getProjects.handler',
      environment: {
        PROJECTS_TABLE: props.projectTable.tableName
      }
    })

    props.projectTable.grantReadWriteData(getProjectsFn);





  

    const managementAPI = new RestApi(this, `${id}-managementAPI`);

    const authorizer = new CfnAuthorizer(this, `${id}-managementToolAuthorizer`, {
      restApiId: managementAPI.restApiId,
      type: 'COGNITO_USER_POOLS', 
      name: `${id}-managementToolAuthorizer`,
      providerArns: [props.managementToolUserPool.userPoolArn], 
      identitySource: 'method.request.header.Authorization',
     });

    const authProps: MethodOptions = {authorizer: {authorizerId: authorizer.ref}, authorizationType: AuthorizationType.COGNITO  }

    const projectResource = managementAPI.root.addResource("projects")

    projectResource.addCorsPreflight({
      allowMethods: ['POST', 'GET'],
      allowOrigins: ['*'],
   })
    
    projectResource.addMethod('POST', new LambdaIntegration(createProjectFn), authProps);
    projectResource.addMethod('GET', new LambdaIntegration(getProjectsFn), authProps);
    
  }
}
