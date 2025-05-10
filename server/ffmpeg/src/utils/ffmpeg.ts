import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure FFmpeg path
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfprobePath('/usr/bin/ffprobe');

interface ProcessVideoOptions {
  inputUrl: string;
  outputFormat: string;
  videoCodec: string;
  audioCodec: string;
  videoBitrate: string;
  audioBitrate: string;
  tempDir: string;
}

export async function processVideo(options: ProcessVideoOptions): Promise<string> {
  const {
    inputUrl,
    outputFormat,
    videoCodec,
    audioCodec,
    videoBitrate,
    audioBitrate,
    tempDir,
  } = options;

  // Validate input URL
  if (!inputUrl) {
    throw new Error('Input URL is required');
  }

  console.log('Processing video with options:', {
    inputUrl,
    outputFormat,
    videoCodec,
    audioCodec,
    videoBitrate,
    audioBitrate,
    tempDir
  });

  // Ensure temp directory exists
  await fs.mkdir(tempDir, { recursive: true });

  // Generate unique output filename
  const outputFilename = `${uuidv4()}.${outputFormat}`;
  const outputPath = path.join(tempDir, outputFilename);

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputUrl)
      .videoCodec(videoCodec === 'h264' ? 'libx264' : videoCodec)
      .audioCodec(audioCodec)
      .videoBitrate(videoBitrate)
      .audioBitrate(audioBitrate)
      .format(outputFormat)
      .output(outputPath);

    // Add progress logging
    command.on('progress', (progress) => {
      console.log(`Processing: ${progress.percent}% done`);
    });

    // Add start logging
    command.on('start', (commandLine) => {
      console.log('Started FFmpeg with command:', commandLine);
    });

    command.on('end', () => {
      console.log('FFmpeg processing finished successfully');
      resolve(outputPath);
    });

    command.on('error', (err: Error & { code?: string }) => {
      console.error('FFmpeg error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        inputUrl
      });
      reject(new Error(`FFmpeg error: ${err.message}`));
    });

    command.run();
  });
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error cleaning up temp file ${filePath}:`, error);
  }
} 