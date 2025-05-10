import dotenv from 'dotenv';
import { ServiceConfig, Environment, formatSqsUrl, QueueConfig } from '@fretstop/shared';
import { ApiConfig } from './types';
// Load environment variables
dotenv.config();

export const ffmpegInQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_IN as string;
export const ffmpegOutQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_OUT as string;
export const ffmpegDlqQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_DLQ as string;

export const fbInQueueName = process.env.SQS_QUEUE_NAME_FB_IN as string;
export const fbOutQueueName = process.env.SQS_QUEUE_NAME_FB_OUT as string;
export const fbDlqQueueName = process.env.SQS_QUEUE_NAME_FB_DLQ as string;

export const testInQueueName = process.env.SQS_QUEUE_NAME_TEST_IN as string;
export const testOutQueueName = process.env.SQS_QUEUE_NAME_TEST_OUT as string;
export const testDlqQueueName = process.env.SQS_QUEUE_NAME_TEST_DLQ as string;

export const mediaBucketName = process.env.S3_VIDEO_BUCKET as string;
export const audioBucketName = process.env.S3_AUDIO_BUCKET as string;

export const TABLES = {
  MEDIA: 'media',
  USERS: 'users',
  REELS: 'reels',
  OPERATIONS: 'operations',
  VIDEO_USER_ASSOCIATIONS: 'video_user_associations',
};

const defaultSqsConfig: Partial<QueueConfig> = {
  visibilityTimeout: Number(process.env.SQS_QUEUE_VISIBILITY_TIMEOUT),
  maxMessages: Number(process.env.SQS_QUEUE_MAX_MESSAGES),
  waitTimeSeconds: Number(process.env.SQS_QUEUE_WAIT_TIME_SECONDS)
};

const createSqsConfig = (queueName: string, dlqName: string, outQueueName: string): QueueConfig => {
  return {
    ...defaultSqsConfig as QueueConfig,
    queueName,
    dlqName,
    outQueueName,
  };
};

export const config: ServiceConfig<ApiConfig> = {
  aws: {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_ENDPOINT as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    }
  },
  dynamoDB: {
    endpoint: process.env.DYNAMODB_ENDPOINT as string
  },
  sqs: [
    createSqsConfig(ffmpegInQueueName, ffmpegDlqQueueName, ffmpegOutQueueName),
    createSqsConfig(fbInQueueName, fbDlqQueueName, fbOutQueueName),
    createSqsConfig(testInQueueName, testDlqQueueName, testOutQueueName)
  ],
  s3: [{
    bucketName: mediaBucketName
  }, {
    bucketName: audioBucketName
  }],
  serviceDiscovery: {
    name: process.env.API_SERVICE_NAME as string,
    host: process.env.CONSUL_HOST as string,
    port: Number(process.env.CONSUL_PORT),
    tags: ['api', 'video-processing'],
    check: {
      http: `http://${process.env.API_INTERNAL_HOST}:${process.env.API_PORT}/api/health`,
      interval: '10s',
      timeout: '5s',
    }
  },  

  environment: process.env.NODE_ENV as Environment,

  service: {
    host: process.env.API_INTERNAL_HOST as string,
    port: Number(process.env.API_PORT),
    debugPort: Number(process.env.API_DEBUG_PORT) || 9229,
    swaggerPath: '/api-docs',
    config: {
      ffmpeg: {
        host: process.env.FFMPEG_INTERNAL_HOST as string,
        port: Number(process.env.FFMPEG_PORT),
        queueName: process.env.FFMPEG_QUEUE_NAME as string,
      },
      jwt: {
        secret: process.env.JWT_SECRET as string,
      }
    }
  }
};

export const getFfmpegQueueUrl = (): string => {
  return formatSqsUrl(config, config.service.config.ffmpeg.queueName);
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate config on startup
validateConfig(); 