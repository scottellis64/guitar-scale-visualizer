import { QueueManagerService } from './queue_manager_service';
import { config } from '../config';
import { processVideo } from '../utils/ffmpeg';
import { createQueueManagerService } from '../factory';
import { FacebookService } from './facebook_service';

export class WorkerService {
  private queueManager: QueueManagerService;
  private isRunning: boolean = false;
  private facebookService: FacebookService;

  constructor(queueUrl: string) {
    this.queueManager = createQueueManagerService(queueUrl);
    this.facebookService = new FacebookService();
  }

  async start(): Promise<void> {
    this.isRunning = true;
    console.log('Starting FFmpeg worker...');
    // Initialize the queue
    try {
      console.log('Initializing queue...');
      await this.queueManager.initialize();
      console.log('Queue initialized successfully');
    } catch (error) {
      console.error('Error initializing queue:', error);
      throw error;
    }

    while (this.isRunning) {
      try {
        const messages = await this.queueManager.receiveMessages();
        
        for (const message of messages) {
          try {
            const job = JSON.parse(message.Body || '{}');
            await this.processJob(job);
            await this.queueManager.deleteMessage(message.ReceiptHandle || '');
          } catch (error) {
            console.error('Error processing job:', error);
            // Don't delete the message - let it go to DLQ after max retries
            // The message will be automatically moved to DLQ after max retries
            // This allows for manual inspection and handling of failed messages
          }
        }
      } catch (error) {
        console.error('Error in worker loop:', error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    console.log('Shutting down FFmpeg worker...');
  }

  private async processJob(job: any): Promise<void> {
    console.log('Processing job:', JSON.stringify(job, null, 2));

    const { type, params } = job;

    switch (type) {
      case 'FACEBOOK_DOWNLOAD':
        const result = await this.facebookService.downloadVideo({
          url: params.url,
          title: params.title
        });
        console.log('Facebook download completed:', {
          filename: result.filename,
          size: result.buffer.length,
          mimetype: result.mimetype
        });
        // TODO: Handle the downloaded video buffer (e.g., save to S3, send to another service, etc.)
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