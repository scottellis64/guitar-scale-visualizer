import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Log the current working directory and .env file path
const envPath = path.resolve(process.cwd(), '.env');
console.log('Current working directory:', process.cwd());
console.log('Looking for .env file at:', envPath);
console.log('Does .env file exist?', fs.existsSync(envPath));

// Load environment variables from the mounted .env file
const result = dotenv.config({ path: envPath });
console.log('dotenv config result:', result);

// Log all environment variables that start with AWS_
console.log('AWS Environment Variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('AWS_'))
  .forEach(key => console.log(`${key}=${process.env[key]}`));

console.log('AWS ENDPOINT', process.env.AWS_ENDPOINT);

export const config = {
  server: {
    host: process.env.FFMPEG_INTERNAL_HOST as string,
    port: Number(process.env.FFMPEG_PORT),
    swaggerPath: '/api-docs',
  },
  aws: {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.AWS_ENDPOINT as string,
    serviceId: process.env.AWS_SERVICE_ID as string,
    namespaceId: process.env.AWS_NAMESPACE_ID as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    },
    forcePathStyle: true,
    sqs: {
      visibilityTimeout: Number(process.env.FFMPEG_QUEUE_VISIBILITY_TIMEOUT),
      maxMessages: Number(process.env.FFMPEG_QUEUE_MAX_MESSAGES),
    },
    s3: {
      bucket: process.env.FFMPEG_S3_BUCKET as string,
      region: process.env.FFMPEG_S3_REGION as string,
    }
  },
  consul: {
    host: process.env.CONSUL_HOST,
    port: Number(process.env.CONSUL_PORT),
  },
  ffmpeg: {
    tempDir: process.env.FFMPEG_TEMP_DIR as string,
    maxConcurrentJobs: Number(process.env.FFMPEG_MAX_CONCURRENT_JOBS),
    defaultOutputFormat: process.env.FFMPEG_DEFAULT_OUTPUT_FORMAT as string,
    defaultVideoCodec: process.env.FFMPEG_DEFAULT_VIDEO_CODEC as string,
    defaultAudioCodec: process.env.FFMPEG_DEFAULT_AUDIO_CODEC as string,
    defaultVideoBitrate: process.env.FFMPEG_DEFAULT_VIDEO_BITRATE as string,
    defaultAudioBitrate: process.env.FFMPEG_DEFAULT_AUDIO_BITRATE as string,
    highQualityVideoBitrate: process.env.FFMPEG_HIGH_QUALITY_VIDEO_BITRATE as string,
    queueName: process.env.FFMPEG_QUEUE_NAME as string,
    facebookProcessorQueueName: process.env.FFMPEG_FACEBOOK_PROCESSOR_QUEUE_NAME || 'facebook-processor',
  },
  logging: {
    level: process.env.FFMPEG_LOG_LEVEL as string,
    format: process.env.FFMPEG_LOG_FORMAT as string,
  },
  environment: process.env.NODE_ENV as string,
} as const;

// Log the full config object
console.log('Full config object:', JSON.stringify({
  ...config,
  aws: {
    ...config.aws,
    credentials: config.aws.credentials ? '***' : undefined
  }
}, null, 2));

// Type for the config object
export type Config = typeof config;

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'FFMPEG_QUEUE_NAME',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate config on startup
validateConfig();

// Helper function for AWS resource names
export const getFfmpegQueueUrl = (): string => {
  return `${config.aws.endpoint}/queue/${config.ffmpeg.queueName}`;
};