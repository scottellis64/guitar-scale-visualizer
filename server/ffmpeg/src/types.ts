export type FFmpegConfig = {
  tempDir: string;
  maxConcurrentJobs: number;
  defaultOutputFormat: string;
  defaultVideoCodec: string;
  defaultAudioCodec: string;
  defaultVideoBitrate: string;
  defaultAudioBitrate: string;
  highQualityVideoBitrate: string;
  inQueueName: string;
  outQueueName: string;
  dlqQueueName: string;
} 