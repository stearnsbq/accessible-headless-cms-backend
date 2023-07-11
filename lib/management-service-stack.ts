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

  private managementAPI: RestApi;

  constructor(scope: Construct, id: string, props: ManagementProps) {
    super(scope, id, props);

    this.createProjectsResources(scope, id, props);

    
  }


  private createProjectResources(scope: Construct, id: string, props: ManagementProps){

    const editProjectFn = new Function(this, `${id}-editProject`, {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/editProject')),
      handler: 'editProject.handler',
      environment: {
        PROJECTS_TABLE: props.projectTable.tableName
      }
    })

    const upsertModelFn = new Function(this, `${id}-upsertModel`, {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/upsertModel')),
      handler: 'upsertModel.handler',
      environment: {
        PROJECTS_TABLE: props.projectTable.tableName
      }
    })

    const projectResource = this.managementAPI.root.addResource("project");
    
    projectResource.addCorsPreflight({
      allowMethods: ['POST', 'GET', 'PUT'],
      allowOrigins: ['*'],
    })

    const projectIDResource = projectResource.addResource("{project}");

        
    projectIDResource.addCorsPreflight({
      allowMethods: ['POST', 'GET', 'PUT'],
      allowOrigins: ['*'],
    })

    projectIDResource.addMethod('PUT', new LambdaIntegration(editProjectFn));

    const projectModelResource = projectIDResource.addResource("model");

    projectModelResource.addCorsPreflight({
      allowMethods: ['POST', 'GET', 'PUT'],
      allowOrigins: ['*'],
    })

    projectModelResource.addMethod('POST', new LambdaIntegration(upsertModelFn))

    const modelIDResource = projectModelResource.addResource("{model}");

    modelIDResource.addMethod('PUT', new LambdaIntegration(upsertModelFn))

  }


  private createProjectsResources(scope: Construct, id: string, props: ManagementProps){

        /**Create Projects Lambda*/
        const createProjectFn = new Function(this, `${id}-createProject`, {
          runtime: Runtime.NODEJS_18_X,
          code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/createProject')),
          handler: 'createProject.handler',
          environment: {
            PROJECTS_TABLE: props.projectTable.tableName
          }
        })
    
        props.projectTable.grantReadWriteData(createProjectFn);
    
       /**Get Projects Lambda*/
        const getProjectsFn = new Function(this, `${id}-getProjects`, {
          runtime: Runtime.NODEJS_18_X,
          code: Code.fromAsset(join(this.MANAGEMENT_SERVICE_DIR, 'handlers/getProjects')),
          handler: 'getProjects.handler',
          environment: {
            PROJECTS_TABLE: props.projectTable.tableName
          }
        })
    
        props.projectTable.grantReadWriteData(getProjectsFn);

    
         this.managementAPI = new RestApi(this, `${id}-managementAPI`);
    
        const authorizer = new CfnAuthorizer(this, `${id}-managementToolAuthorizer`, {
          restApiId: this.managementAPI.restApiId,
          type: 'COGNITO_USER_POOLS', 
          name: `${id}-managementToolAuthorizer`,
          providerArns: [props.managementToolUserPool.userPoolArn], 
          identitySource: 'method.request.header.Authorization',
         });
    
        const authProps: MethodOptions = {authorizer: {authorizerId: authorizer.ref}, authorizationType: AuthorizationType.COGNITO};
    
        const projectsResource = this.managementAPI.root.addResource("projects");
    
        projectsResource.addCorsPreflight({
          allowMethods: ['POST', 'GET'],
          allowOrigins: ['*'],
       })
        
       projectsResource.addMethod('POST', new LambdaIntegration(createProjectFn), authProps);
       projectsResource.addMethod('GET', new LambdaIntegration(getProjectsFn), authProps);

  }


}
