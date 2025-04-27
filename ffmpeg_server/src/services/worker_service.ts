import { QueueManagerService } from './queue_manager_service';
import { config } from '../config';
import { processVideo } from '../utils';
import { createQueueManagerService, createFacebookService, createYoutubeService } from '../factory';

export class WorkerService {
  private queueManager: QueueManagerService;
  private isRunning: boolean = false;
  private facebookService: ReturnType<typeof createFacebookService>;
  private youtubeService: ReturnType<typeof createYoutubeService>;

  constructor(queueUrl: string) {
    this.queueManager = createQueueManagerService(queueUrl);
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

    const { type, params } = job;

    switch (type) {
      case 'FACEBOOK_DOWNLOAD':
        await this.facebookService.downloadVideo({
          url: params.url,
          title: params.title,
          operationId: params.operationId
        });
        break;

      case 'YOUTUBE_DOWNLOAD':
        await this.youtubeService.downloadVideo({
          url: params.url,
          quality: params.quality,
          title: params.title,
          operationId: params.operationId
        });
        break;

      case 'VIDEO_PROCESSING':
        const {
          inputUrl,
          outputFormat = config.ffmpeg.defaultOutputFormat,
          videoCodec = config.ffmpeg.defaultVideoCodec,
          audioCodec = config.ffmpeg.defaultAudioCodec,
          videoBitrate = config.ffmpeg.defaultVideoBitrate,
          audioBitrate = config.ffmpeg.defaultAudioBitrate,
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
          tempDir: config.ffmpeg.tempDir,
        });
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
} 