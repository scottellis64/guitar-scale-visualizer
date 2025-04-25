import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { config } from '../config';
import { createS3Client, createDynamoDBDocumentClient } from '../factory';

// Initialize clients
const s3Client = createS3Client();
const ddbDocClient = createDynamoDBDocumentClient();

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
    Bucket: config.aws.s3.bucket,
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

  await ddbDocClient.send(new PutCommand({
    TableName: getTableName('media'),
    Item: mediaItem,
  }));

  return mediaItem;
}

export async function getMedia(id: string): Promise<{ metadata: MediaMetadata; stream: ReadableStream }> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await ddbDocClient.send(new GetCommand({
    TableName: getTableName('media'),
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Get file from S3
  const { Body: stream } = await s3Client.send(new GetObjectCommand({
    Bucket: config.aws.s3.bucket,
    Key: metadata.s3Key,
  }));

  return {
    metadata: metadata as MediaMetadata,
    stream: stream as ReadableStream,
  };
}

export async function deleteMedia(id: string): Promise<void> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await ddbDocClient.send(new GetCommand({
    TableName: getTableName('media'),
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Delete from S3
  await s3Client.send(new DeleteObjectCommand({
    Bucket: config.aws.s3.bucket,
    Key: metadata.s3Key,
  }));

  // Delete from DynamoDB
  await ddbDocClient.send(new DeleteCommand({
    TableName: getTableName('media'),
    Key: { id },
  }));
}

export async function listMedia(userId: string): Promise<MediaMetadata[]> {
  const { Items: mediaItems } = await ddbDocClient.send(new ScanCommand({
    TableName: getTableName('media'),
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

function getTableName(tableName: string): string {
  return `${config.aws.dynamodb.tablePrefix}${tableName}`;
}
  