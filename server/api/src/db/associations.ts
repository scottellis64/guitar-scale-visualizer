import * as dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { TABLES } from '../config';

// Video-User Association Schema
const VideoUserAssociationSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: {
      name: "userIdIndex",
      type: "global"
    }
  }
}, {
  timestamps: true
});

// Create the model
const VideoUserAssociation = dynamoose.model(TABLES.VIDEO_USER_ASSOCIATIONS, VideoUserAssociationSchema, {
  create: true,
  waitForActive: true
});

export async function createVideoUserAssociation(videoId: string, userId: string, metadata: any = {}) {
  const association = await VideoUserAssociation.create({
    id: uuidv4(),
    videoId,
    userId,
    ...metadata,
  });
  return association.id;
}

export async function getVideoUserAssociations(userId: string) {
  const result = await VideoUserAssociation.scan('userId').eq(userId).exec();
  return result.map(item => item.toJSON());
}

export async function hasVideoAccess(userId: string, videoId: string): Promise<boolean> {
  const result = await VideoUserAssociation.scan('userId')
    .eq(userId)
    .where('videoId')
    .eq(videoId)
    .exec();
  return result.count > 0;
}

export async function deleteVideoUserAssociation(userId: string, videoId: string) {
  const result = await VideoUserAssociation.scan('userId')
    .eq(userId)
    .where('videoId')
    .eq(videoId)
    .exec();

  if (result.count > 0) {
    await VideoUserAssociation.delete(result[0].id);
  }
} 