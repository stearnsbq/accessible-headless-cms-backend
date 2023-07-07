import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { ListTablesCommand, DynamoDBClient, UpdateItemInput, PutItemInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { NewProjectInput } from '../../model/NewProjectInput';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const db = DynamoDBDocument.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE ?? '';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try{

        if(!event?.body){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false, err: 'Missing body'
                }),
            };
        }

        const body = JSON.parse(event.body) as NewProjectInput;



        const projectID: string = randomUUID();

        const putParams = {
            TableName: PROJECTS_TABLE,
            Item: {
                'id': projectID,
                'name': body.name,
                'dateCreated': new Date().toISOString(),
                'users': [],
            }
        }


        await db.put(putParams);

  
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true, data: projectID, message: 'Project created'
            }),
        };

    }catch(err){
        return {
            statusCode: 500,
            body: JSON.stringify({
              success: false, err: 'Failed'
            }),
        };
    }
  
};