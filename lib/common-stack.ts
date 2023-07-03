import * as cdk from 'aws-cdk-lib';
import { UserPool, UserPoolIdentityProviderGoogle } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CommonStack extends cdk.Stack {
  public projectTable: Table;
  public userTable: Table;
  public modelTable: Table;
  public contentTable: Table;
  public managementToolUserPool: UserPool;
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      Project Table:

      Will store the metadata for individual projects, user access, and role information
    */
    this.projectTable = new Table(this, `${id}-projectTable`, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    });

    /*
      Users Table:

      Will store the metadata for users. The application is intended to have password-less auth so we need to store users somehow
    */
    this.userTable = new Table(this, `${id}-userTable`, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      }
    });

    /*
      Model Table:

      Will store content model schemas for individual projects

      Partition Key will be the project the model is from

      Sort Key will be the model's ID
    */
      this.modelTable = new Table(this, `${id}-modelTable`, {
        partitionKey: {
          name: 'project',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'model',
          type: AttributeType.STRING
        }
      }
    )
    
    /*
      Content Table:

      Will store content for the projects

      Partition Key will be the project the content is from
 
      Sort Key will be the following format

      Model#<MODEL ID>#Content#<CONTENT ID>

    */
    this.contentTable = new Table(this, `${id}-contentTable`, {
        partitionKey: {
          name: 'project',
          type: AttributeType.STRING
        },
        sortKey: {
          name: 'content',
          type: AttributeType.STRING
        }
      }
    )


  
     this.managementToolUserPool = new UserPool(this, `${id}-managementToolUserPool`);


  }
}
