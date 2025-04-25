import { SQSClient, CreateQueueCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand, SetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { config } from '../config';
import { FacebookDownloadParams } from './facebook_service';
import { YoutubeDownloadParams } from './youtube_service';
import { ConversionParams, ExtractAudioParams } from './conversion_service';
import { createSQSClient } from '../factory';

export interface QueueMessage {
  taskId: string;
  type: 'FACEBOOK_DOWNLOAD' | 'YOUTUBE_DOWNLOAD' | 'CONVERT' | 'EXTRACT';
  params: FacebookDownloadParams | YoutubeDownloadParams | ConversionParams | ExtractAudioParams;
  receiptHandle?: string;
}

interface AwsError extends Error {
  $response?: any;
  name: string;
}

export class QueueManagerService {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private dlqUrl: string;
  private maxRetries: number = 3;

  constructor(queueUrl: string) {
    this.queueUrl = queueUrl;
    this.sqsClient = createSQSClient();
    // Create DLQ URL by appending -dlq to the queue name
    const queueName = queueUrl.split('/').pop();
    this.dlqUrl = queueUrl.replace(queueName!, `${queueName}-dlq`);
  }

  async initialize() {
    try {
      // Extract queue name from URL
      const queueName = this.queueUrl.split('/').pop();
      if (!queueName) {
        throw new Error('Invalid queue URL');
      }

      console.log(`Initializing queue ${queueName} at ${this.queueUrl}`);

      // Create DLQ first
      const dlqCommand = new CreateQueueCommand({
        QueueName: `${queueName}-dlq`,
        Attributes: {
          MessageRetentionPeriod: '1209600' // 14 days for DLQ
        }
      });

      try {
        const dlqResponse = await this.sqsClient.send(dlqCommand);
        console.log(`DLQ ${queueName}-dlq created or already exists:`, dlqResponse);
      } catch (error: any) {
        if (error.name === 'QueueNameExists') {
          console.log(`DLQ ${queueName}-dlq already exists`);
        } else {
          throw error;
        }
      }

      // Create main queue with DLQ configuration
      const command = new CreateQueueCommand({
        QueueName: queueName,
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
        console.log(`Queue ${queueName} created or already exists:`, response);
      } catch (error: any) {
        if (error.name === 'QueueNameExists') {
          console.log(`Queue ${queueName} already exists`);
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
          console.log(`Updated queue ${queueName} with DLQ configuration`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initializing queue:', error);
      const awsError = error as AwsError;
      if (awsError.$response) {
        console.error('Raw response:', awsError.$response);
      }
      throw error;
    }
  }

  async receiveMessages(): Promise<any[]> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: config.aws.sqs.maxMessages,
        VisibilityTimeout: config.aws.sqs.visibilityTimeout,
        WaitTimeSeconds: 20,
      });

      const response = await this.sqsClient.send(command);
      const messages = response.Messages || [];

      // Log raw message bodies for debugging
      messages.forEach((message, index) => {
        console.log(`Raw message ${index + 1}:`, message.Body);
        try {
          const parsedBody = JSON.parse(message.Body || '{}');
          console.log(`Parsed message ${index + 1}:`, JSON.stringify(parsedBody, null, 2));
        } catch (error) {
          console.error(`Error parsing message ${index + 1}:`, error);
        }
      });

      return messages;
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