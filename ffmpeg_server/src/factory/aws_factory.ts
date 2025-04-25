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

// SQS Client Factory
export const createSQSClient = (endpoint?: string) => {
  const clientConfig = {
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || 'http://localstack:4566',
      tls: false,
      forcePathStyle: true,
      region: config.aws.region,
      credentials: config.aws.credentials,
      // Add these options for LocalStack
      requestHandler: {
        // Remove timeout settings to allow for indefinite waiting
      },
      // Tell the client to use the provided endpoint
      useQueueUrlAsEndpoint: false
    }),
  };

  console.log('Creating SQS client with config:', {
    ...clientConfig,
    credentials: clientConfig.credentials ? '***' : undefined
  });

  return new SQSClient(clientConfig);
};

// Service Discovery Client Factory
export const createServiceDiscoveryClient = (endpoint?: string) => {
  return new ServiceDiscoveryClient({
    ...getBaseAwsConfig(),
    ...(config.environment === 'development' && {
      endpoint: endpoint || 'http://localstack:4566',
      tls: false,
      forcePathStyle: true,
      region: config.aws.region,
      credentials: config.aws.credentials
    }),
  });
}; 