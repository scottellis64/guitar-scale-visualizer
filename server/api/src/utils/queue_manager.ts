import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config';
import { createSQSClient, formatSqsUrl } from '@fretstop/shared';

interface QueueMessage {
  taskId: string;
  type: 'convert' | 'download' | 'extract';
  params: any;
  payload?: any;
  callbackUrl?: string;
  receiptHandle?: string;
}

export class QueueManager {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(queueName: string) {
    this.queueUrl = formatSqsUrl(config, queueName);
    this.sqsClient = createSQSClient(config);
  }

  async sendToQueue(message: QueueMessage): Promise<string> {
    const result = await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        TaskType: {
          DataType: 'String',
          StringValue: message.type,
        },
      },
    }));

    return result.MessageId || '';
  }

  async processQueueMessage(): Promise<QueueMessage | null> {
    const result = await this.sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
      MessageAttributeNames: ['All'],
    }));

    if (!result.Messages || result.Messages.length === 0) {
      return null;
    }

    const message = result.Messages[0];
    const body = JSON.parse(message.Body || '{}') as QueueMessage;

    return {
      ...body,
      receiptHandle: message.ReceiptHandle,
    };
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    await this.sqsClient.send(new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    }));
  }
} 