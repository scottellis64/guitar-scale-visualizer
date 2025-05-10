import { NotificationService, QueueManagerService, ServiceDiscoveryService, StorageService } from '../services';
import { ServiceConfig } from '../types';

export const createQueueManagerService = (queueName: string, serviceConfig: ServiceConfig<any>): QueueManagerService<any> => {
  return new QueueManagerService(queueName, serviceConfig);
};

export const createServiceDiscoveryService = (serviceConfig: ServiceConfig<any>): ServiceDiscoveryService => {
  return new ServiceDiscoveryService(serviceConfig);
};

export const createStorageService = (serviceConfig: ServiceConfig<any>, bucketName: string): StorageService => {
  return new StorageService(serviceConfig, bucketName);
};

export const createNotificationService = (serviceConfig: ServiceConfig<any>): NotificationService => {
  return new NotificationService(serviceConfig);
};
