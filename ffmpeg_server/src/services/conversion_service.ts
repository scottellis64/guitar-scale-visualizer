import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config';

const execAsync = promisify(exec);

export interface ConversionParams {
  inputBuffer: Buffer;
  inputFormat: string;
  outputFormat: string;
  quality?: string;
  title?: string;
  userId?: string;
}

export interface ExtractAudioParams {
  inputBuffer: Buffer;
  inputFormat: string;
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
    const { inputBuffer, inputFormat, outputFormat, quality, title } = params;
    const tempInputPath = path.join(this.tempDir, `convert_${Date.now()}.${inputFormat}`);
    const tempOutputPath = path.join(this.tempDir, `convert_${Date.now()}_output.${outputFormat}`);

    try {
      // Write input buffer to temporary file
      await fs.writeFile(tempInputPath, inputBuffer);

      // Process the media with ffmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .outputOptions('-c:v', config.ffmpeg.defaultVideoCodec)
          .outputOptions('-c:a', config.ffmpeg.defaultAudioCodec)
          .outputOptions('-b:a', config.ffmpeg.defaultAudioBitrate)
          .outputOptions('-b:v', quality === 'high' ? config.ffmpeg.highQualityVideoBitrate : config.ffmpeg.defaultVideoBitrate)
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

      // Clean up temporary files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);

      return {
        buffer: outputBuffer,
        filename: title ? `${title}.${outputFormat}` : `converted_${Date.now()}.${outputFormat}`,
        mimetype: `video/${outputFormat}`
      };
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
    const { inputBuffer, inputFormat, outputFormat, title } = params;
    const tempInputPath = path.join(this.tempDir, `extract_${Date.now()}.${inputFormat}`);
    const tempOutputPath = path.join(this.tempDir, `extract_${Date.now()}_output.${outputFormat}`);

    try {
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

      // Clean up temporary files
      await fs.unlink(tempInputPath);
      await fs.unlink(tempOutputPath);

      return {
        buffer: outputBuffer,
        filename: title ? `${title}.${outputFormat}` : `extracted_${Date.now()}.${outputFormat}`,
        mimetype: `audio/${outputFormat}`
      };
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