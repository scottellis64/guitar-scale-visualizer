import { WorkerService } from '../services/worker_service';
import { ConversionService } from '../services/conversion_service';
import { YoutubeService } from '../services/youtube_service';
import { FacebookService } from '../services/facebook_service';
import { config } from '../config';

export const createWorkerService = (): WorkerService => {
  const queueUrl = config.environment === 'development' 
    ? `${config.aws.endpoint}/000000000000/${config.ffmpeg.queueName}`
    : `${config.aws.endpoint}/queue/${config.ffmpeg.queueName}`;
  return new WorkerService(queueUrl);
};

export const createConversionService = (): ConversionService => {
  return new ConversionService();
};

export const createYoutubeService = (): YoutubeService => {
  return new YoutubeService();
};

export const createFacebookService = (): FacebookService => {
  return new FacebookService();
}; 