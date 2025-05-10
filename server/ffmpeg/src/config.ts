import dotenv from 'dotenv';
import path from 'path';

import { ServiceConfig, Environment, formatSqsUrl } from '@fretstop/shared';
import { FFmpegConfig } from 'types';

// Log the current working directory and .env file path
const envPath = path.resolve(process.cwd(), '.env');

// Load environment variables from the mounted .env file
dotenv.config({ path: envPath });

const ffmpegInQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_IN as string;
const ffmpegOutQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_OUT as string;
const ffmpegDlqQueueName = process.env.SQS_QUEUE_NAME_FFMPEG_DLQ as string;

export const config: ServiceConfig<FFmpegConfig> = {
  service: {
    host: process.env.FFMPEG_INTERNAL_HOST as string,
    port: Number(process.env.FFMPEG_PORT),
    debugPort: Number(process.env.FFMPEG_DEBUG_PORT),
    swaggerPath: '/api-docs',
    config: {
      tempDir: process.env.FFMPEG_TEMP_DIR as string,
      maxConcurrentJobs: Number(process.env.FFMPEG_MAX_CONCURRENT_JOBS),
      defaultOutputFormat: process.env.FFMPEG_DEFAULT_OUTPUT_FORMAT as string,
      defaultVideoCodec: process.env.FFMPEG_DEFAULT_VIDEO_CODEC as string,
      defaultAudioCodec: process.env.FFMPEG_DEFAULT_AUDIO_CODEC as string,
      defaultVideoBitrate: process.env.FFMPEG_DEFAULT_VIDEO_BITRATE as string,
      defaultAudioBitrate: process.env.FFMPEG_DEFAULT_AUDIO_BITRATE as string,
      highQualityVideoBitrate: process.env.FFMPEG_HIGH_QUALITY_VIDEO_BITRATE as string,
      inQueueName: process.env.SQS_QUEUE_NAME_FFMPEG_IN as string,
      outQueueName: process.env.SQS_QUEUE_NAME_FFMPEG_OUT as string,
      dlqQueueName: process.env.SQS_QUEUE_NAME_FFMPEG_DLQ as string
    }
  },
  aws: {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_ENDPOINT as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
  },
  sqs: [{
    queueName: ffmpegInQueueName,
    dlqName: ffmpegDlqQueueName,
    outQueueName: ffmpegOutQueueName,
    visibilityTimeout: Number(process.env.SQS_QUEUE_VISIBILITY_TIMEOUT),
    maxMessages: Number(process.env.SQS_QUEUE_MAX_MESSAGES),
    waitTimeSeconds: Number(process.env.SQS_QUEUE_WAIT_TIME_SECONDS),
  }],
  s3: [{
    bucketName: process.env.S3_VIDEO_BUCKET as string
  }, {
    bucketName: process.env.S3_AUDIO_BUCKET as string
  }],
  serviceDiscovery: {
    name: process.env.FFMPEG_SERVICE_NAME as string,
    host: process.env.CONSUL_HOST as string,
    port: Number(process.env.CONSUL_PORT)
  },  
  logging: {
    level: process.env.FFMPEG_LOG_LEVEL as string,
    format: process.env.FFMPEG_LOG_FORMAT as string,
  },
  environment: process.env.NODE_ENV as Environment,
} as const;

// Log the full config object
// console.log('Full config object:', JSON.stringify({
//   ...config,
//   aws: {
//     ...config.aws,
//     credentials: config.aws.credentials ? '***' : undefined
//   }
// }, null, 2));

// Type for the config object
export type Config = typeof config;

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'SQS_QUEUE_NAME_FFMPEG_IN',
    'SQS_QUEUE_NAME_FFMPEG_OUT',
    'SQS_QUEUE_NAME_FFMPEG_DLQ',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate config on startup
validateConfig();

// Helper function for AWS resource names
export const getQueueUrl = (queueName: string): string => {
  if (config.environment === 'development') {
    return `${config.aws.endpoint}/000000000000/${queueName}`;
  }
  return `${config.aws.endpoint}/${queueName}`;
};

export const getFfmpegInQueueUrl = (): string => {
  return formatSqsUrl(config, ffmpegInQueueName);
};

export const getFfmpegOutQueueUrl = (): string => {
  return formatSqsUrl(config, ffmpegOutQueueName);
};

export const getFfmpegDlqQueueUrl = (): string => {
  return formatSqsUrl(config, ffmpegDlqQueueName);
};
