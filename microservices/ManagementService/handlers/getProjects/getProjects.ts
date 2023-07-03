import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { ListTablesCommand, DynamoDBClient, UpdateItemInput, PutItemInput, QueryInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { NewProjectInput } from '../../model/NewProjectInput';

const client = new DynamoDBClient({});
const db = DynamoDBDocument.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE ?? '';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try{

        if(!event.pathParameters || !event.pathParameters['project']){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false, err: 'missing project'
                }),
            }
        }
        
        const queryParams = {
            TableName: PROJECTS_TABLE,
            KeyConditionExpression: 'project = :project',
            ExpressionAttributeValues:{
                ':project': event!.pathParameters!['project']
            }
        }

        const result = await getAllItems(queryParams);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true, data: result, message: 'Project created'
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

async function getAllItems(params: any){
    let accumulated: any[] = [];
    let LastEvaluatedKey;
    do{

        const result = await db.query(params);

        LastEvaluatedKey = result.LastEvaluatedKey
        accumulated = [...accumulated, ...(result.Items ?? [])]
    }while(LastEvaluatedKey)

    return accumulated;
}