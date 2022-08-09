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

    try {
        const taskId = event.queryStringParameters?.[PRIMARY_KEY!];

        const deleteResult = await dbClient
            .delete({
                TableName: TABLE_NAME,
                Key: {
                    [PRIMARY_KEY]: taskId,
                },
                ReturnValues: 'ALL_OLD',
            })
            .promise();

        if (!deleteResult.Attributes) {
            throw new Error('Cannot delete item. Check exercise id');
        } else {
            result.body = JSON.stringify(`task with id ${taskId} has been deleted`);
        }
    } catch (error: any) {
        result.statusCode = 400;
        result.body = error.message;
    }

    return result;
}

export { handler };
