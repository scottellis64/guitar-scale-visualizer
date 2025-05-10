import { CreateQueueCommand, SQSClient } from '@aws-sdk/client-sqs';
import { ServiceConfig, QueueConfig } from '../types/config';

export const formatSqsUrl = (serviceConfig: ServiceConfig<any>, queueName: string) => {
  return serviceConfig.environment === 'development'
    ? `${serviceConfig.aws.endpoint}/000000000000/${queueName}`
    : `${serviceConfig.aws.endpoint}/queue/${queueName}`;
};

export const getQueueConfig = (serviceConfig: ServiceConfig<any>, queueName: string): QueueConfig => {
  const queueConfig = serviceConfig.sqs?.find(q => q.queueName === queueName);

  if (!queueConfig) {
    throw new Error(`Queue ${queueName} not found in service config`);
  }

  return queueConfig;
};

export const initializeQueues = async (configs: QueueConfig[], sqsClient: SQSClient) => {
  return Promise.all(configs.map(async (config) => {
    return Promise.all([config.queueName, config.dlqName, config.outQueueName].map(async (queueName) => {   
      try {
        await sqsClient.send(new CreateQueueCommand({
          QueueName: queueName
        }));
        console.log(`Created SQS queue: ${queueName}`);
      } catch (error: any) {
        if (error.name !== 'QueueNameExists') {
          console.error('Error creating queue:', error);
          throw error;
        }
      }
    }));
  }));
}

