//lambda function to get exercises
import { DynamoDB } from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'

const TABLE_NAME = 'tasksTable'
const PRIMARY_KEY = 'id'
const dbClient = new DynamoDB.DocumentClient()

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: '',
  }
  try {
    if (event.queryStringParameters) {
      if (PRIMARY_KEY! in event.queryStringParameters) {
        result.body = await queryWithPrimaryPartition(event.queryStringParameters)
      }
    } else {
      result.body = await scanTable()
    }
  } catch (error: any) {
    result.body = error.message
    result.statusCode = 400
  }
  return result
}
// for getting single item from table
async function queryWithPrimaryPartition(queryParams: APIGatewayProxyEventQueryStringParameters) {
  const keyValue = queryParams[PRIMARY_KEY!]
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      KeyConditionExpression: '#p = :p',
      ExpressionAttributeNames: {
        '#p': PRIMARY_KEY!,
      },
      ExpressionAttributeValues: {
        ':p': keyValue,
      },
    })
    .promise()
  if (queryResponse.Items!.length < 1) {
    throw new Error('task not found')
  } else {
    return JSON.stringify(queryResponse.Items)
  }
}
// getting all the items from the table
async function scanTable() {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!,
    })
    .promise()
  if (queryResponse.Items!.length < 1) {
    throw new Error('tasks not found')
  } else {
    return JSON.stringify(queryResponse.Items)
  }
}

export { handler }
