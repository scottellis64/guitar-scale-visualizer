import { ConversionService, YoutubeService, FacebookService, SQSListenerService } from '../services';
import { config } from '../config';

export const createConversionService = (): ConversionService => {
  return new ConversionService();
};

export const createYoutubeService = (): YoutubeService => {
  return new YoutubeService();
};

export const createFacebookService = (): FacebookService => {
  return new FacebookService();
};

export const createSQSListenerService = (): SQSListenerService => {
  return new SQSListenerService(config.service.config.inQueueName);
};
