import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const dbClient = new DynamoDB.DocumentClient();
const TABLE = 'tasksTable';

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };
    const task = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    task.id = uuid();
    try {
        await dbClient
            .put({
                TableName: TABLE!,
                Item: task,
            })
            .promise();
    } catch (error: any) {
        result.body = error.message;
    }
    result.body = JSON.stringify(`create item with id: ${task.id}`);
    return result;
}

export { handler };
