import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client } from '../factory';
import { config } from '../config';

export interface S3File {
  bucket: string;
  key: string;
  contentType: string;
}

export interface StorageResult {
  s3File: S3File;
}

export class StorageService {
  private s3Client;

  constructor() {
    this.s3Client = createS3Client();
  }

  async downloadFromS3(bucket: string, key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key
      }));

      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading from S3:', error);
      throw new Error(`Failed to download file from S3: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveVideoToS3(params: {
    buffer: Buffer;
    operationId: string;
    title?: string;
    contentType?: string;
    prefix?: string;
  }): Promise<StorageResult> {
    const { buffer, operationId, title, contentType = 'video/mp4', prefix = 'videos' } = params;
    
    // Generate unique S3 key
    const s3Key = `${prefix}/${operationId}/${title ? `${title}.mp4` : `video_${Date.now()}.mp4`}`;

    // Upload to S3
    console.log('Uploading to S3...');
    await this.s3Client.send(new PutObjectCommand({
      Bucket: config.aws.s3.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType
    }));

    return {
      s3File: {
        bucket: config.aws.s3.bucket,
        key: s3Key,
        contentType
      }
    };
  }

  async saveAudioToS3(params: {
    buffer: Buffer;
    operationId: string;
    title?: string;
    format?: 'mp3' | 'm4a' | 'wav';
    prefix?: string;
  }): Promise<StorageResult> {
    const { buffer, operationId, title, format = 'mp3', prefix = 'audio' } = params;
    
    // Map format to content type
    const contentTypeMap: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'm4a': 'audio/mp4',
      'wav': 'audio/wav'
    };

    const contentType = contentTypeMap[format] || 'audio/mpeg';
    
    // Generate unique S3 key
    const s3Key = `${prefix}/${operationId}/${title ? `${title}.${format}` : `audio_${Date.now()}.${format}`}`;

    // Upload to S3
    console.log('Uploading audio to S3...');
    await this.s3Client.send(new PutObjectCommand({
      Bucket: config.aws.s3.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType
    }));

    return {
      s3File: {
        bucket: config.aws.s3.bucket,
        key: s3Key,
        contentType
      }
    };
  }
} 