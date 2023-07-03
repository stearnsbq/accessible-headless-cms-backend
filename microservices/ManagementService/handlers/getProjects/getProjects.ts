import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { ListTablesCommand, DynamoDBClient, UpdateItemInput, PutItemInput, QueryInput, ScanInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { NewProjectInput } from '../../model/NewProjectInput';

const client = new DynamoDBClient({});
const db = DynamoDBDocument.from(client);

const PROJECTS_TABLE = process.env.PROJECTS_TABLE ?? '';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    try{
        const scanParams : ScanInput = {
            TableName: PROJECTS_TABLE,
        }

        const result = await getAllItems(scanParams);

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

async function getAllItems(params: ScanInput){
    let accumulated: any[] = [];
    let LastEvaluatedKey;
    do{

        const result = await db.scan(params);

        LastEvaluatedKey = result.LastEvaluatedKey
        accumulated = [...accumulated, ...(result.Items ?? [])]
    }while(LastEvaluatedKey)

    return accumulated;
}