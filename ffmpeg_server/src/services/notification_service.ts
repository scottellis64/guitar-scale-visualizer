import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { createSQSClient } from '../factory';
import { config } from '../config';
import { S3File } from './storage_service';

export type NotificationType = 
  | 'FACEBOOK_VIDEO_READY' 
  | 'YOUTUBE_VIDEO_READY'
  | 'CONVERSION_COMPLETE'
  | 'AUDIO_EXTRACTION_COMPLETE';

export interface ExtendedS3File extends S3File {
  sourceS3File?: {
    bucket: string;
    key: string;
  };
}

export interface NotificationParams {
  operationId: string;
  type: NotificationType;
  s3File: ExtendedS3File;
}

export class NotificationService {
  private sqsClient;

  constructor() {
    this.sqsClient = createSQSClient();
  }

  async sendNotification(params: NotificationParams): Promise<void> {
    const { operationId, type, s3File } = params;
    
    // Send message to SQS with S3 file information
    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: `${config.aws.endpoint}/queue/${config.ffmpeg.queueName}`,
      MessageBody: JSON.stringify({
        operationId,
        type,
        s3File
      })
    }));
  }
} 