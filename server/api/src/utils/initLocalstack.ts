import { CreateBucketCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import { createS3Client, createSQSClient, initializeQueues, ServiceConfig } from '@fretstop/shared';
import axios from 'axios';
import { ApiConfig } from '../types';
import { BUCKETS } from './constants';
import { DBManagerService } from '../services';

// Initialize clients with LocalStack-specific configuration
const s3Client = createS3Client(config.aws);
const sqsClient = createSQSClient(config as ServiceConfig<ApiConfig>);

async function waitForLocalStack(maxAttempts = 30, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const localstackUrl = `${config.aws.endpoint}/_localstack/health`;
      const response = await axios.get(localstackUrl);
      const dynamoDBStatus = response?.data?.services?.dynamodb;
      if (dynamoDBStatus && (dynamoDBStatus === 'available' || dynamoDBStatus === 'running')) {
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
    await DBManagerService.getInstance().init();

    // Create S3 buckets
    for (const bucket of Object.values(BUCKETS)) {
      try {
        await s3Client.send(new CreateBucketCommand({
          Bucket: bucket,
        }));
        console.log(`Created S3 bucket: ${bucket}`);
      } catch (error: any) {
        if (error.name === 'BucketAlreadyOwnedByYou') {
          console.log(`Bucket ${bucket} already exists`);
        } else {
          console.error('Error creating bucket:', error);
          throw error;
        }
      }
    }

    // Create SQS queues
    config.sqs && await initializeQueues(config.sqs, sqsClient);

    console.log('LocalStack initialization complete');
  } catch (error) {
    console.error('Error initializing LocalStack:', error);
    throw error;
  }
} 