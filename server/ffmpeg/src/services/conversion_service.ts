import { promises as fs } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';
import { createStorageService, createNotificationService } from '@fretstop/shared';

const storageService = createStorageService(config, 'ffmpeg');
const notificationService = createNotificationService(config);

export interface ConversionParams {
  operationId: string;
  sourceS3File: {
    bucket: string;
    key: string;
  };
  outputFormat: string;
  quality?: string;
  title?: string;
  userId?: string;
}

export interface ExtractAudioParams {
  operationId: string;
  sourceS3File: {
    bucket: string;
    key: string;
  };
  outputFormat: string;
  title?: string;
  userId?: string;
}

export class ConversionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
  }

  async convertMedia(params: ConversionParams) {
    const { operationId, sourceS3File, outputFormat, quality, title } = params;
    const tempInputPath = path.join(this.tempDir, `convert_${Date.now()}.${path.extname(sourceS3File.key)}`);
    const tempOutputPath = path.join(this.tempDir, `convert_${Date.now()}_output.${outputFormat}`);

    const {
      defaultVideoCodec,
      defaultAudioCodec,
      defaultVideoBitrate,
      defaultAudioBitrate,
      highQualityVideoBitrate
    } = config.service.config;

    try {
      // Download from S3
      console.log('Downloading from S3...');
      const inputBuffer = await storageService.downloadFromS3(sourceS3File.bucket, sourceS3File.key);

      // Write input buffer to temporary file
      await fs.writeFile(tempInputPath, inputBuffer);

      // Process the media with ffmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .outputOptions('-c:v', defaultVideoCodec)
          .outputOptions('-c:a', defaultAudioCodec)
          .outputOptions('-b:a', defaultAudioBitrate)
          .outputOptions('-b:v', quality === 'high' ? highQualityVideoBitrate : defaultVideoBitrate)
          .output(tempOutputPath)
          .on('start', (commandLine) => {
            console.log('Started FFmpeg with command:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Processing: ', progress.percent, '% done');
          })
          .on('end', () => {
            console.log('FFmpeg processing finished');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });

      // Read the processed file
      const outputBuffer = await fs.readFile(tempOutputPath);

      // Save to S3
      const storageResult = await storageService.saveVideoToS3({
        buffer: outputBuffer,
        operationId,
        title,
        contentType: `video/${outputFormat}`,
        prefix: 'converted'
      });

      // Send notification
      await notificationService.sendNotification({
        queueName: config.service.config.outQueueName,
        operationId,
        type: 'CONVERSION_COMPLETE',
        content: {
          ...storageResult.s3File,
          sourceS3File: sourceS3File
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

  async extractAudio(params: ExtractAudioParams) {
    const { operationId, sourceS3File, outputFormat, title } = params;
    const tempInputPath = path.join(this.tempDir, `extract_${Date.now()}.${path.extname(sourceS3File.key)}`);
    const tempOutputPath = path.join(this.tempDir, `extract_${Date.now()}_output.${outputFormat}`);

    try {
      // Download from S3
      console.log('Downloading from S3...');
      const inputBuffer = await storageService.downloadFromS3(sourceS3File.bucket, sourceS3File.key);

      // Write input buffer to temporary file
      await fs.writeFile(tempInputPath, inputBuffer);

      // Process the media with ffmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .audioBitrate(192)
          .format(outputFormat)
          .output(tempOutputPath)
          .on('start', (commandLine) => {
            console.log('Started FFmpeg with command:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Processing: ', progress.percent, '% done');
          })
          .on('end', () => {
            console.log('FFmpeg processing finished');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });

      // Read the processed file
      const outputBuffer = await fs.readFile(tempOutputPath);

      // Save to S3
      const storageResult = await storageService.saveAudioToS3({
        buffer: outputBuffer,
        operationId,
        title,
        format: outputFormat as 'mp3' | 'm4a' | 'wav',
        prefix: 'extracted'
      });

      // Send notification
      await notificationService.sendNotification({
        queueName: config.service.config.outQueueName,
        operationId,
        type: 'AUDIO_EXTRACTION_COMPLETE',
        content: {
          ...storageResult.s3File,
          sourceS3File: sourceS3File
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