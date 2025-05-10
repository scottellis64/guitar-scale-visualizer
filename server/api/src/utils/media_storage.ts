import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { config, mediaBucketName } from '../config';
import { createS3Client } from '@fretstop/shared';
import { Readable } from 'stream';
import { DBManagerService } from '../services';

// Initialize S3 client
const s3Client = createS3Client(config.aws);

// Get DynamoDB client when needed
const getDDBDocClient = () => DBManagerService.getInstance().getDDBDocClient();

interface MediaMetadata {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  s3Key: string;
  createdAt: string;
  userId: string;
  // Add any other metadata fields you need
}

export async function saveMedia(
  file: Express.Multer.File,
  userId: string,
  metadata: Partial<MediaMetadata>
): Promise<MediaMetadata> {
  const id = metadata.id || crypto.randomUUID();
  const s3Key = `media/${userId}/${id}/${file.originalname}`;
  
  // Upload to S3
  await s3Client.send(new PutObjectCommand({
    Bucket: mediaBucketName,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  // Save metadata to DynamoDB
  const mediaItem: MediaMetadata = {
    id,
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    s3Key,
    createdAt: new Date().toISOString(),
    userId,
    ...metadata,
  };

  await getDDBDocClient().send(new PutCommand({
    TableName: 'media',
    Item: mediaItem,
  }));

  return mediaItem;
}

export async function getMedia(id: string): Promise<{ metadata: MediaMetadata; stream: Readable }> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await getDDBDocClient().send(new GetCommand({
    TableName: 'media',
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Get file from S3
  const { Body: stream } = await s3Client.send(new GetObjectCommand({
    Bucket: mediaBucketName,
    Key: metadata.s3Key,
  }));

  return {
    metadata: metadata as MediaMetadata,
    stream: stream as Readable,
  };
}

export async function deleteMedia(id: string): Promise<void> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await getDDBDocClient().send(new GetCommand({
    TableName: 'media',
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Delete from S3
  await s3Client.send(new DeleteObjectCommand({
    Bucket: mediaBucketName,
    Key: metadata.s3Key,
  }));

  // Delete from DynamoDB
  await getDDBDocClient().send(new DeleteCommand({
    TableName: 'media',
    Key: { id },
  }));
}

export async function listMedia(userId: string): Promise<MediaMetadata[]> {
  const { Items: mediaItems } = await getDDBDocClient().send(new ScanCommand({
    TableName: 'media',
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
  }));

  return mediaItems as unknown as MediaMetadata[];
}

export async function getMediaUrl(id: string): Promise<string> {
  const { metadata } = await getMedia(id);
  return metadata.s3Key;
}

  