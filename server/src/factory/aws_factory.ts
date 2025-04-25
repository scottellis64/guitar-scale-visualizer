import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { ServiceDiscoveryClient } from "@aws-sdk/client-servicediscovery";
import { config } from '../config';

// Base AWS configuration
const getBaseAwsConfig = () => ({
  region: config.aws.region,
  ...(config.environment === 'development' && {
    credentials: {
      accessKeyId: config.aws.credentials.accessKeyId,
      secretAccessKey: config.aws.credentials.secretAccessKey,
    },
    forcePathStyle: true,
    maxAttempts: 3,
  }),
});

// DynamoDB Client Factory
export const createDynamoDBClient = (endpoint?: string) => {
  return new DynamoDBClient({
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || config.aws.dynamodb.endpoint,
      tls: false,
    }),
  });
};

// DynamoDB Document Client Factory
export const createDynamoDBDocumentClient = (endpoint?: string) => {
  return DynamoDBDocumentClient.from(createDynamoDBClient(endpoint));
};

// S3 Client Factory
export const createS3Client = (endpoint?: string) => {
  return new S3Client({
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || config.aws.s3.endpoint,
      tls: false,
    }),
  });
};

// SQS Client Factory
export const createSQSClient = (endpoint?: string) => {
  return new SQSClient({
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || config.aws.sqs.endpoint,
      tls: false,
    }),
  });
};

// Service Discovery Client Factory
export const createServiceDiscoveryClient = (endpoint?: string) => {
  return new ServiceDiscoveryClient({
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || config.aws.endpoint,
      tls: false,
    }),
  });
}; 