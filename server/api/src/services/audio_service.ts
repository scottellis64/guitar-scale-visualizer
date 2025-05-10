import { Readable, PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

export class AudioService {
  private static instance: AudioService;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public async downloadAudio(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  public async convertAudio(inputBuffer: Buffer, format: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(inputBuffer);
      const chunks: Buffer[] = [];
      const outputStream = new PassThrough();

      ffmpeg(inputStream)
        .toFormat(format)
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .writeToStream(outputStream);

      outputStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    });
  }

  public async extractAudio(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(inputBuffer);
      const chunks: Buffer[] = [];
      const outputStream = new PassThrough();

      ffmpeg(inputStream)
        .toFormat('mp3')
        .on('error', reject)
        .on('end', () => resolve(Buffer.concat(chunks)))
        .writeToStream(outputStream);

      outputStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    });
  }
} 

export const audioService = AudioService.getInstance();