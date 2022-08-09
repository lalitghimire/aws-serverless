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
        const taskTable = new dynamodb.Table(this, 'tasksTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'tasksTable',
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // define an api gateway
        const taskApi = new RestApi(this, 'tasksApi');

        // lambda functions
        const createTask = new NodejsFunction(this, 'createTask', {
            entry: join(__dirname, '..', 'functions', 'createTask.ts'),
            handler: 'handler',
        });
        const readTasks = new NodejsFunction(this, 'readTasks', {
            entry: join(__dirname, '..', 'functions', 'readTasks.ts'),
            handler: 'handler',
        });
        const deleteTask = new NodejsFunction(this, 'deleteTask', {
            entry: join(__dirname, '..', 'functions', 'deleteTask.ts'),
            handler: 'handler',
        });
        const updateTask = new NodejsFunction(this, 'updateTask', {
            entry: join(__dirname, '..', 'functions', 'updateTask.ts'),
            handler: 'handler',
        });

        // dynamodb permission to the lambda functions
        taskTable.grantWriteData(createTask);
        taskTable.grantReadData(readTasks);
        taskTable.grantReadWriteData(deleteTask);
        taskTable.grantReadWriteData(updateTask);

        // api-lambda integration
        const createTaskIntegration = new LambdaIntegration(createTask);
        const readTaskIntegration = new LambdaIntegration(readTasks);
        const deleteTaskIntegration = new LambdaIntegration(deleteTask);
        const updateTaskIntegration = new LambdaIntegration(updateTask);

        // create routes
        const taskResources = taskApi.root.addResource('tasks');
        taskResources.addMethod('POST', createTaskIntegration);
        taskResources.addMethod('GET', readTaskIntegration);
        taskResources.addMethod('DELETE', deleteTaskIntegration);
        taskResources.addMethod('PUT', updateTaskIntegration);
    }
}
