import { 
  AudioDownloadRequest,
  AudioConversionRequest,
  AudioExtractionRequest,
  Task,
  QueueItem,
  QueueMessage
} from './audio';

import {
  DownloadReelRequest
} from './facebook';

export {
  AudioDownloadRequest,
  AudioConversionRequest,
  AudioExtractionRequest,
  Task,
  QueueItem,
  QueueMessage,
  DownloadReelRequest
}; 

export type ApiConfig = {
  ffmpeg: {
    host: string;
    port: number;
    queueName: string;
  },
  jwt: {
    secret: string;
  }
}