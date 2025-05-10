import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createStorageService, createNotificationService, NotificationService, StorageService } from '@fretstop/shared';
import { config } from '../config';
const execAsync = promisify(exec);

export interface YoutubeDownloadParams {
  url: string;
  quality?: string;
  title?: string;
  userId?: string;
  operationId: string;
  sourceS3File: {
    bucket: string;
    key: string;
  };
}

// Quality presets for different video sizes
const QUALITY_PRESETS = {
  'low': 'worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst',
  'medium': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
  'high': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]',
  'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
} as const;

type QualityOption = keyof typeof QUALITY_PRESETS;

export class YoutubeService {
  private tempDir: string;
  private storageService: StorageService;
  private notificationService: NotificationService;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.storageService = createStorageService(config, 'ffmpeg');
    this.notificationService = createNotificationService(config);
  }

  async downloadVideo(params: YoutubeDownloadParams) {
    const { url, quality = 'best', title, operationId } = params;
    const tempInputPath = path.join(this.tempDir, `yt_${Date.now()}.mp4`);
    const tempOutputPath = path.join(this.tempDir, `yt_${Date.now()}_output.mp4`);

    try {
      // Get the quality format string
      const qualityFormat = QUALITY_PRESETS[quality as QualityOption] || QUALITY_PRESETS.best;

      // Download video using yt-dlp
      await execAsync(`yt-dlp -f "${qualityFormat}" -o "${tempInputPath}" "${url}"`);

      // Verify the downloaded file
      const stats = await fs.stat(tempInputPath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Process the video with ffmpeg if needed
      await execAsync(`ffmpeg -i "${tempInputPath}" -c:v copy -c:a copy "${tempOutputPath}"`);

      // Read the processed file
      const outputBuffer = await fs.readFile(tempOutputPath);

      // Save to S3 and get file information
      const storageResult = await this.storageService.saveVideoToS3({
        buffer: outputBuffer,
        operationId,
        title,
        prefix: 'youtube'
      });

      // Send notification
      await this.notificationService.sendNotification({
        queueName: config.service.config.outQueueName,
        operationId,
        type: 'YOUTUBE_VIDEO_READY',
        content: {
          ...storageResult.s3File,
          sourceS3File: {
            bucket: params.sourceS3File.bucket,
            key: params.sourceS3File.key
          }
        }
      });

      // Clean up temporary files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);

      return storageResult;
    } catch (error) {
      // Clean up temporary files in case of error
      try {
        await fs.unlink(tempInputPath);
        await fs.unlink(tempOutputPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
      }
      throw error;
    }
  }
} 