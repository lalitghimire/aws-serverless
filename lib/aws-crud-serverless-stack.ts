import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

export class AwsCrudServerlessStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // database setup
        const taskTable = new dynamodb.Table(this, 'tasks', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'tasks',
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // define an api gateway
        const taskApi = new RestApi(this, 'tasksApi');

        // lambda functions
        const createTask = new NodejsFunction(this, 'createExercises', {
            entry: join(__dirname, '..', 'functions', 'createTask.ts'),
            handler: 'handler',
        });

        // dynamodb permission to the lambda functions
        taskTable.grantWriteData(createTask);

        // api-lambda integration
        const createTaskIntegration = new LambdaIntegration(createTask);

        // create routes
        const taskResources = taskApi.root.addResource('tasks');
        taskResources.addMethod('POST', createTaskIntegration);
    }
}
