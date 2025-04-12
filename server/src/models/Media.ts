import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  title: string;
  description: string;
  type: 'video' | 'audio';
  url: string;
  duration: number; // in seconds
  thumbnailUrl?: string;
  guitarId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['video', 'audio'],
    },
    url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnailUrl: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Media = mongoose.model<IMedia>('Media', MediaSchema); 