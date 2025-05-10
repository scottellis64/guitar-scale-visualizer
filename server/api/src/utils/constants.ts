export const BUCKETS = {
  MEDIA: 'media-bucket',
  AUDIO: 'audio-bucket',
  VIDEO: 'video-bucket',
  REELS: 'reels-bucket',
} as const;

export const OPERATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;
