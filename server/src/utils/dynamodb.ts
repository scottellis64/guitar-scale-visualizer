
import { createDynamoDBClient, createDynamoDBDocumentClient, createS3Client } from '../factory';
import { config } from '../config';
import { TABLES, BUCKETS } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize AWS clients
const dynamoDBClient = createDynamoDBClient();
export const ddbDocClient = createDynamoDBDocumentClient();
const s3Client = createS3Client();

// Helper function to get table name with environment prefix
export function getTableName(table: string): string {
  return `${config.environment}-${table}`;
}

// Helper function to get bucket name with environment prefix
export function getBucketName(bucket: string): string {
  return `${config.environment}-${bucket}`;
}

// Media storage functions
export async function saveMedia(
  file: Express.Multer.File,
  userId: string,
  metadata: any,
  bucket: string
): Promise<string> {
  const id = uuidv4();
  const s3Key = `${bucket}/${userId}/${id}/${file.originalname}`;
  
  // Upload to S3
  await s3Client.send(new PutObjectCommand({
    Bucket: getBucketName(bucket),
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  // Save metadata to DynamoDB
  const mediaItem = {
    id,
    userId,
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    s3Key,
    createdAt: new Date().toISOString(),
    ...metadata,
  };

  await ddbDocClient.send(new PutCommand({
    TableName: getTableName(bucket),
    Item: mediaItem,
  }));

  return id;
}

export async function getMedia(id: string, bucket: string): Promise<{ metadata: any; url: string }> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await ddbDocClient.send(new GetCommand({
    TableName: getTableName(bucket),
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Generate presigned URL for S3 object
  const command = new GetObjectCommand({
    Bucket: getBucketName(bucket),
    Key: metadata.s3Key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    metadata,
    url,
  };
}

export async function deleteMedia(id: string, bucket: string): Promise<void> {
  // Get metadata from DynamoDB
  const { Item: metadata } = await ddbDocClient.send(new GetCommand({
    TableName: getTableName(bucket),
    Key: { id },
  }));

  if (!metadata) {
    throw new Error('Media not found');
  }

  // Delete from S3
  await s3Client.send(new DeleteObjectCommand({
    Bucket: getBucketName(bucket),
    Key: metadata.s3Key,
  }));

  // Delete from DynamoDB
  await ddbDocClient.send(new DeleteCommand({
    TableName: getTableName(bucket),
    Key: { id },
  }));
}

// User operations
export async function createUser(userData: { username: string; email: string; password: string }) {
  const id = uuidv4();
  const user = {
    id,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ddbDocClient.send(new PutCommand({
    TableName: TABLES.USERS,
    Item: user
  }));

  return id;
}

export async function getUser(id: string) {
  const result = await ddbDocClient.send(new GetCommand({
    TableName: TABLES.USERS,
    Key: { id }
  }));

  if (!result.Item) {
    return null;
  }

  // Remove password from response
  const { password, ...user } = result.Item;
  return user;
}

export async function listUsers() {
  const result = await ddbDocClient.send(new ScanCommand({
    TableName: TABLES.USERS
  }));

  return result.Items?.map(({ password, ...user }) => user) || [];
}

// List media items
export async function listMedia(bucket: string, userId?: string): Promise<any[]> {
  const command = userId
    ? new QueryCommand({
        TableName: getTableName(bucket),
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    : new QueryCommand({
        TableName: getTableName(bucket),
      });

  const { Items } = await ddbDocClient.send(command);
  return Items || [];
}
 