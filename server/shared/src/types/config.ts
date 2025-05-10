export type AwsConfig = {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  endpoint: string;
}

export type QueueConfig = {
  queueName: string;
  dlqName: string;
  outQueueName: string;
  maxMessages: number;
  visibilityTimeout: number;
  waitTimeSeconds: number;
}

export type S3Config = {
  bucketName: string;
}

export type DynamoDBConfig = {
  tableName?: string;
  endpoint: string;
}

export type ConsulConfig = {
  host: string;
  port: number;
  name: string;
  address?: string;
  tags?: string[];
  check?: {
    name?: string;
    http?: string;
    interval?: string;
    timeout?: string;
  }
}

export type AWSServiceDiscoveryConfig = {
  namespaceId: string;
  serviceName: string;
  serviceType: string;
  serviceId: string;
  serviceAddress: string;
  servicePort: number;
}

export type ServiceDiscoveryConfig = AWSServiceDiscoveryConfig | ConsulConfig;

export type LoggingConfig = {
  level: string;
  format: string;
}

export type VideoConfig = {
  tempDir: string;
  maxConcurrentJobs: number;
  defaultOutputFormat: string;
  defaultVideoCodec: string;
  defaultAudioCodec: string;
  defaultVideoBitrate: string;
  defaultAudioBitrate: string;
  highQualityVideoBitrate: string;
}

export type AudioConfig = {
  defaultOutputFormat: string;
  defaultAudioCodec: string;
  defaultAudioBitrate: string;
}

export enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export type ServiceTypeConfig<T> = {
  host: string;
  port: number;
  debugPort: number;
  swaggerPath: string;
  config: T;
}

export type ServiceConfig<T> = {
  aws: AwsConfig;
  environment: Environment;
  sqs?: QueueConfig[];
  s3?: S3Config[];
  dynamoDB?: DynamoDBConfig;
  serviceDiscovery?: ServiceDiscoveryConfig;
  logging?: LoggingConfig;
  video?: VideoConfig;
  audio?: AudioConfig;
  service: ServiceTypeConfig<T>;
}
