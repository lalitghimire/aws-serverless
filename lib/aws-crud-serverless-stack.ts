import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class AwsCrudServerlessStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // database setup
        const taskTable = new dynamodb.Table(this, 'tasks', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'tasks',
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
