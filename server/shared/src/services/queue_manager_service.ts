import { SQSClient, CreateQueueCommand, ReceiveMessageCommand, DeleteMessageCommand, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';

import { createSQSClient } from '../factory';
import { ServiceConfig, AwsError, QueueConfig } from '../types';
import { formatSqsUrl, getQueueConfig } from '../utils';

export class QueueManagerService<T> {
  private sqsClient: SQSClient;
  private queueName: string;
  private queueUrl: string;
  private dlqUrl: string;
  private maxRetries: number = 3;
  private queueConfig: QueueConfig;

  constructor(queueName: string, serviceConfig: ServiceConfig<T>) {
    this.queueConfig = getQueueConfig(serviceConfig, queueName);
    this.sqsClient = createSQSClient(serviceConfig);
    this.queueName = queueName;

    this.queueUrl = formatSqsUrl(serviceConfig, queueName);
    this.dlqUrl = formatSqsUrl(serviceConfig, this.queueConfig.dlqName);
  }

  async initialize() {
    try {
      await this.initializeDlq();
      await this.initializeMainQueue();
    } catch (error) {
      console.error('Error initializing queue:', error);
      const awsError = error as AwsError;
      if (awsError.$response) {
        console.error('Raw response:', awsError.$response);
      }
      throw error;
    }
  }

  async initializeMainQueue() {
      // Create main queue with DLQ configuration
      const command = new CreateQueueCommand({
        QueueName: this.queueConfig.queueName,
        Attributes: {
          VisibilityTimeout: '300', // 5 minutes
          MessageRetentionPeriod: '86400', // 24 hours
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: this.dlqUrl,
            maxReceiveCount: this.maxRetries
          })
        }
      });

      try {
        const response = await this.sqsClient.send(command);
        console.log(`Queue ${this.queueName} created or already exists:`, response);
      } catch (error: any) {
        if (error.name === 'QueueNameExists') {
          console.log(`Queue ${this.queueName} already exists`);
          // Update existing queue with DLQ configuration
          const updateCommand = new SetQueueAttributesCommand({
            QueueUrl: this.queueUrl,
            Attributes: {
              RedrivePolicy: JSON.stringify({
                deadLetterTargetArn: this.dlqUrl,
                maxReceiveCount: this.maxRetries
              })
            }
          });
          await this.sqsClient.send(updateCommand);
          console.log(`Updated queue ${this.queueName} with DLQ configuration`);
        } else {
          throw error;
        }
      }
  }

  async initializeDlq() {
    console.log(`Initializing dead letter queue ${this.queueConfig.dlqName} at ${this.dlqUrl}`);

    try {
      // Create DLQ first
      const dlqCommand = new CreateQueueCommand({
        QueueName: this.queueConfig.dlqName,
        Attributes: {
          MessageRetentionPeriod: '1209600' // 14 days for DLQ
        }
      });

      try {
        const dlqResponse = await this.sqsClient.send(dlqCommand);
        console.log(`DLQ ${this.queueConfig.dlqName} created or already exists:`, dlqResponse);
      } catch (error: any) {
        if (error.name === 'QueueNameExists') {
          console.log(`DLQ ${this.queueConfig.dlqName} already exists`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initializing dead letter queue:', error);
      const awsError = error as AwsError;
      if (awsError.$response) {
        console.error('Raw response:', awsError.$response);
      }
    }
  }

  async receiveMessages(): Promise<any[]> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: this.queueConfig.maxMessages,
        VisibilityTimeout: this.queueConfig.visibilityTimeout,
        WaitTimeSeconds: this.queueConfig.waitTimeSeconds,
      });

      const response = await this.sqsClient.send(command);
      return response.Messages || [];

      // Log raw message bodies for debugging
      // messages.forEach((message, index) => {
      //   console.log(`Raw message ${index + 1}:`, message.Body);
      //   try {
      //     const parsedBody = JSON.parse(message.Body || '{}');
      //     console.log(`Parsed message ${index + 1}:`, JSON.stringify(parsedBody, null, 2));
      //   } catch (error) {
      //     console.error(`Error parsing message ${index + 1}:`, error);
      //   }
      // });

      // return messages;
    } catch (error) {
      console.error('Error receiving messages:', error);
      const awsError = error as AwsError;
      if (awsError.$response) {
        console.error('Raw response:', awsError.$response);
      }
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
    } catch (error) {
      console.error('Error deleting message:', error);
      const awsError = error as AwsError;
      if (awsError.$response) {
        console.error('Raw response:', awsError.$response);
      }
      throw error;
    }
  }
} 