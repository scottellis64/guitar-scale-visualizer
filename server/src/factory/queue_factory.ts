import { QueueManager } from '../utils/queue_manager';

export const createQueueManager = (queueName: string, endpoint?: string) => {
  return new QueueManager(queueName, endpoint);
}; 