import { createS3Client } from '@fretstop/shared';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';
import { config, TABLES } from '../config';
import { DBManagerService } from '../services';

const s3Client = createS3Client(config.aws);

// Media Schema
const MediaSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: {
      name: "userIdIndex",
      type: "global"
    }
  },
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create the model
const Media = dynamoose.model(TABLES.MEDIA, MediaSchema, {
  create: true,
  waitForActive: true
});

export async function saveMedia(
  file: Express.Multer.File,
  userId: string,
  metadata: any,
  bucket: string
) {
  const id = uuidv4();
  const s3Key = `${bucket}/${userId}/${id}/${file.originalname}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  const media = await Media.create({
    id,
    userId,
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    s3Key,
    ...metadata,
  });

  return media.id;
}

export async function getMedia(id: string, bucket: string) {
  const metadata = await Media.get(id);
  if (!metadata) {
    throw new Error('Media not found');
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: metadata.s3Key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    metadata: metadata.toJSON(),
    url,
  };
}

export async function deleteMedia(id: string, bucket: string) {
  const metadata = await Media.get(id);
  if (!metadata) {
    throw new Error('Media not found');
  }

  await s3Client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: metadata.s3Key,
  }));

  await Media.delete(id);
}

export async function listMedia(bucket: string, userId?: string) {
  const query = userId 
    ? Media.scan('userId').eq(userId)
    : Media.scan();
    
  const result = await query.exec();
  return result.map(item => item.toJSON());
} 