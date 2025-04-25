import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  server: {
    host: process.env.SERVER_HOST as string,
    port: Number(process.env.SERVER_PORT),
    swaggerPath: '/api-docs',
  },
  aws: {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_ENDPOINT as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    forcePathStyle: true,
    serviceId: process.env.AWS_SERVICE_ID as string,
    namespace: process.env.AWS_NAMESPACE as string,
    dynamodb: {
      endpoint: process.env.DYNAMODB_ENDPOINT as string,
      tablePrefix: process.env.DYNAMODB_TABLE_PREFIX as string,
    },
    sqs: {
      endpoint: process.env.SQS_ENDPOINT as string,
      queuePrefix: process.env.SQS_QUEUE_PREFIX as string,
    },
    s3: {
      endpoint: process.env.S3_ENDPOINT as string,
      bucket: process.env.S3_BUCKET as string,
    },
  },
  consul: {
    host: process.env.CONSUL_HOST as string,
    port: Number(process.env.CONSUL_PORT),
  },
  ffmpeg: {
    host: process.env.FFMPEG_INTERNAL_HOST as string,
    port: Number(process.env.FFMPEG_PORT),
    queueName: process.env.FFMPEG_QUEUE_NAME as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
  },
  environment: process.env.NODE_ENV as string,
} as const;

// Type for the config object
export type Config = typeof config;

// Helper functions for AWS resource names
export const getTableName = (tableName: string): string => {
  return `${config.aws.dynamodb.tablePrefix}${tableName}`;
};

export const getQueueUrl = (queueName: string): string => {
  return `${config.aws.sqs.endpoint}/queue/${config.aws.sqs.queuePrefix}${queueName}`;
};

export const getFfmpegQueueUrl = (): string => {
  return `${config.aws.endpoint}/queue/${config.ffmpeg.queueName}`;
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate config on startup
validateConfig(); 