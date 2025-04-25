import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { TABLES, BUCKETS } from './constants';
import { config } from '../config';
import { createDynamoDBClient, createS3Client } from '../factory/aws_factory';
import axios from 'axios';

// Initialize clients with LocalStack-specific configuration
const dynamoDBClient = createDynamoDBClient(config.aws.dynamodb.endpoint);
const s3Client = createS3Client(config.aws.s3.endpoint);

async function waitForLocalStack(maxAttempts = 30, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${config.aws.endpoint}/_localstack/health`);
      if (response.data && response.data.services && response.data.services.dynamodb === 'running') {
        console.log('LocalStack is ready!');
        return true;
      }
      console.log(`Attempt ${attempt}/${maxAttempts}: LocalStack not ready yet...`);
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxAttempts}: LocalStack not ready yet...`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('LocalStack failed to start within the expected time');
}

export async function initializeLocalStack() {
  try {
    // Wait for LocalStack to be ready
    await waitForLocalStack();

    // Create DynamoDB tables
    for (const table of Object.values(TABLES)) {
      const tableName = `${config.environment}-${table}`;
      try {
        await dynamoDBClient.send(new CreateTableCommand({
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'userId-index',
              KeySchema: [
                { AttributeName: 'userId', KeyType: 'HASH' },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        }));
        console.log(`Created DynamoDB table: ${tableName}`);
      } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
          console.log(`Table ${tableName} already exists`);
        } else {
          console.error('Error creating table:', error);
          throw error;
        }
      }
    }

    // Create S3 buckets
    for (const bucket of Object.values(BUCKETS)) {
      const bucketName = `${config.environment}-${bucket}`;
      try {
        await s3Client.send(new CreateBucketCommand({
          Bucket: bucketName,
        }));
        console.log(`Created S3 bucket: ${bucketName}`);
      } catch (error: any) {
        if (error.name === 'BucketAlreadyOwnedByYou') {
          console.log(`Bucket ${bucketName} already exists`);
        } else {
          console.error('Error creating bucket:', error);
          throw error;
        }
      }
    }

    console.log('LocalStack initialization complete');
  } catch (error) {
    console.error('Error initializing LocalStack:', error);
    throw error;
  }
} 