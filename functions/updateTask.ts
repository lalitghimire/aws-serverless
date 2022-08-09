import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = 'tasksTable';
const PRIMARY_KEY = 'id';
const dbClient = new DynamoDB.DocumentClient();

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const taskId = event.queryStringParameters?.[PRIMARY_KEY!];
    const requestBody = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

    const params: any = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: taskId,
        },

        UpdateExpression: 'set #task=:r1 ',
        ExpressionAttributeNames: {
            '#task': 'task',
        },
        ExpressionAttributeValues: { ':r1': requestBody.task },
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const updateResult = await dbClient.update(params).promise();
        result.body = JSON.stringify(`task with id ${taskId} has been updated`);
    } catch (error: any) {
        result.statusCode = 400;
        result.body = error.message;
    }

    return result;
}

export { handler };
