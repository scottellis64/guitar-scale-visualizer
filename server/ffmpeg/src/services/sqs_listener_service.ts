import { config } from '../config';
import { processVideo } from '../utils';
import { createFacebookService, createYoutubeService } from '../factory';
import { QueueManagerService, createQueueManagerService } from '@fretstop/shared';
import { FFmpegConfig } from '../types';

import { FacebookService, YoutubeService } from '.';

export class SQSListenerService {
  private queueManager: QueueManagerService<FFmpegConfig>;
  private isRunning: boolean = false;
  private facebookService: FacebookService;
  private youtubeService: YoutubeService;

  constructor(queueName: string) {
    this.queueManager = createQueueManagerService(queueName, config);
    this.facebookService = createFacebookService();
    this.youtubeService = createYoutubeService();
  }

  async start() {
    if (this.isRunning) {
      console.log('Worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('Worker service started');

    while (this.isRunning) {
      try {
        const messages = await this.queueManager.receiveMessages();
        
        for (const message of messages) {
          try {
            await this.processJob(JSON.parse(message.Body));
            await this.queueManager.deleteMessage(message.ReceiptHandle);
          } catch (error) {
            console.error('Error processing job:', error);
            // Don't delete the message so it can be retried
          }
        }
      } catch (error) {
        console.error('Error in worker loop:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async shutdown() {
    this.isRunning = false;
    console.log('Shutting down worker service...');
  }

  private async processJob(job: any): Promise<void> {
    console.log('Processing job:', JSON.stringify(job, null, 2));

    const { type, url, title, operationId, quality, params } = job;

    const {
      tempDir,
      defaultOutputFormat,
      defaultVideoCodec,
      defaultAudioCodec,
      defaultVideoBitrate,
      defaultAudioBitrate,
    } = config.service.config;

    switch (type) {
      case 'FACEBOOK_DOWNLOAD':
        await this.facebookService.downloadVideo({
          url,
          title,
          operationId,
          sourceS3File: {
            bucket: params.sourceS3File.bucket,
            key: params.sourceS3File.key
          }
        });
        break;

      case 'YOUTUBE_DOWNLOAD':
        await this.youtubeService.downloadVideo({
          url,
          quality,
          title,
          operationId,
          sourceS3File: {
            bucket: params.sourceS3File.bucket,
            key: params.sourceS3File.key
          }
        });
        break;

      case 'VIDEO_PROCESSING':
        const {
          inputUrl,
          outputFormat = defaultOutputFormat,
          videoCodec = defaultVideoCodec,
          audioCodec = defaultAudioCodec,
          videoBitrate = defaultVideoBitrate,
          audioBitrate = defaultAudioBitrate,
        } = params;

        if (!inputUrl) {
          throw new Error('Input URL is required in job');
        }

        await processVideo({
          inputUrl,
          outputFormat,
          videoCodec,
          audioCodec,
          videoBitrate,
          audioBitrate,
          tempDir,
        });
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
} 