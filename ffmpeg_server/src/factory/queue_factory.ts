import { QueueManagerService } from '../services/queue_manager_service';
import { config } from '../config';

export const createQueueManagerService = (queueUrl?: string): QueueManagerService => {
  const url = queueUrl || `${config.aws.endpoint}/queue/${config.ffmpeg.queueName}`;
  return new QueueManagerService(url);
}; 