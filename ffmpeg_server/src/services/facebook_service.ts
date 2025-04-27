import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createStorageService, createNotificationService } from '../factory';

const execAsync = promisify(exec);

export interface FacebookDownloadParams {
  url: string;
  title?: string;
  uploader?: string;
  userId?: string;
  operationId: string;
}

export interface FacebookMetadata {
  title: string;
  uploader: string;
  description: string;
  duration: number;
  viewCount: number;
  uploadDate: string;
  thumbnail: string;
}

export class FacebookService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
  }

  async getMetadata(url: string): Promise<FacebookMetadata> {
    try {
      const command = `yt-dlp --dump-json --no-download "${url}"`;
      const { stdout } = await execAsync(command);
      const metadata = JSON.parse(stdout);
      
      return {
        title: metadata.title || 'Untitled Reel',
        uploader: metadata.uploader || 'Unknown',
        description: metadata.description || '',
        duration: metadata.duration || 0,
        viewCount: metadata.view_count || 0,
        uploadDate: metadata.upload_date ? new Date(metadata.upload_date).toISOString() : new Date().toISOString(),
        thumbnail: metadata.thumbnail || ''
      };
    } catch (error) {
      console.error('Error getting reel metadata:', error);
      throw new Error(`Failed to get reel metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async downloadVideo(params: FacebookDownloadParams) {
    const { url, title, operationId } = params;
    const tempInputPath = path.join(this.tempDir, `fb_${Date.now()}.mp4`);
    const tempOutputPath = path.join(this.tempDir, `fb_${Date.now()}_output.mp4`);

    const storageService = createStorageService();
    const notificationService = createNotificationService();

    console.log('Starting Facebook video download:', {
      url,
      title,
      tempInputPath,
      tempOutputPath
    });

    try {
      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true });

      // Download video using yt-dlp
      console.log('Downloading video with yt-dlp...');
      const downloadResult = await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${tempInputPath}" "${url}"`);
      console.log('yt-dlp output:', downloadResult.stdout);

      // Verify the downloaded file
      const stats = await fs.stat(tempInputPath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      console.log('Downloaded file size:', stats.size);

      // Process the video with ffmpeg if needed
      console.log('Processing video with FFmpeg...');
      const ffmpegResult = await execAsync(`ffmpeg -i "${tempInputPath}" -c:v copy -c:a copy "${tempOutputPath}"`);
      console.log('FFmpeg output:', ffmpegResult.stdout);

      // Read the processed file
      const outputBuffer = await fs.readFile(tempOutputPath);

      // Save to S3 and get file information
      const storageResult = await storageService.saveVideoToS3({
        buffer: outputBuffer,
        operationId,
        title,
        prefix: 'facebook'
      });

      // Send notification
      await notificationService.sendNotification({
        operationId,
        type: 'FACEBOOK_VIDEO_READY',
        s3File: storageResult.s3File
      });

      // Clean up temporary files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);

      return storageResult;
    } catch (error) {
      console.error('Error downloading Facebook video:', error);
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