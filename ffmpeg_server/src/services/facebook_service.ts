import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { config } from '../config';

const execAsync = promisify(exec);

export interface FacebookDownloadParams {
  url: string;
  title?: string;
  uploader?: string;
  userId?: string;
}

export class FacebookService {
  private tempDir: string;

  constructor() {
    this.tempDir = config.ffmpeg.tempDir;
  }

  async downloadVideo(params: FacebookDownloadParams) {
    const { url, title } = params;
    const tempInputPath = path.join(this.tempDir, `fb_${Date.now()}.mp4`);
    const tempOutputPath = path.join(this.tempDir, `fb_${Date.now()}_output.mp4`);

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
      console.log('Video processing completed successfully');

      // Clean up temporary files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);

      return {
        buffer: outputBuffer,
        filename: title ? `${title}.mp4` : `facebook_${Date.now()}.mp4`,
        mimetype: 'video/mp4'
      };
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