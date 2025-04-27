import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { createSQSClient } from '../factory';
import { config } from '../config';
import { TABLES, ddbDocClient } from '../utils';
import { saveMedia } from '../utils';

interface VideoData {
  buffer: string;
  filename: string;
  mimetype: string;
}

interface ProcessedVideo {
  operationId: string;
  type: string;
  videoData: VideoData;
}

const sqsClient = createSQSClient();

export class FacebookProcessor {
  private queueUrl: string;

  constructor() {
    this.queueUrl = `${config.aws.endpoint}/queue/${config.ffmpeg.facebookProcessorQueueName}`;
  }

  async startProcessing() {
    console.log('Starting Facebook video processor...');
    
    while (true) {
      try {
        // Receive messages from the queue
        const { Messages } = await sqsClient.send(new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20
        }));

        if (!Messages || Messages.length === 0) {
          continue;
        }

        for (const message of Messages) {
          try {
            const body = JSON.parse(message.Body || '{}') as ProcessedVideo;
            
            if (body.type === 'FACEBOOK_VIDEO_READY') {
              await this.processVideo(body);
            }

            // Delete the message after processing
            await sqsClient.send(new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle
            }));
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      } catch (error) {
        console.error('Error receiving messages:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processVideo(data: ProcessedVideo) {
    const { operationId, videoData } = data;
    
    try {
      // Convert base64 buffer back to Buffer
      const buffer = Buffer.from(videoData.buffer, 'base64');
      
      // Save the video to S3 and DynamoDB
      await saveMedia(
        {
          buffer,
          originalname: videoData.filename,
          mimetype: videoData.mimetype,
          size: buffer.length
        } as any,
        'system',
        {
          id: operationId,
          filename: videoData.filename,
          contentType: videoData.mimetype,
          size: buffer.length,
          s3Key: `facebook/${operationId}/${videoData.filename}`,
          createdAt: new Date().toISOString(),
          userId: 'system'
        }
      );

      // Update metadata in DynamoDB
      await ddbDocClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: operationId,
          status: 'COMPLETED',
          updatedAt: new Date().toISOString()
        }
      }));

      console.log(`Video processing completed for operation ${operationId}`);
    } catch (error: any) {
      console.error('Error processing video:', error);
      
      // Update status to failed
      await ddbDocClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: operationId,
          status: 'FAILED',
          error: error?.message || 'Unknown error',
          updatedAt: new Date().toISOString()
        }
      }));
    }
  }
} 