import { RegisterInstanceCommand, DiscoverInstancesCommand, ServiceDiscoveryClient } from "@aws-sdk/client-servicediscovery";
import { AWSServiceDiscoveryConfig, ConsulConfig, ServiceConfig, ServiceDiscoveryConfig } from "../types";
import { createServiceDiscoveryClient } from "../factory";
import { registerConsulService, initializeConsul } from '../utils';

export class ServiceDiscoveryService {
  private client?: ServiceDiscoveryClient;
  private config: ServiceConfig<any>;

  constructor(config: ServiceConfig<any>) {
    this.config = config;
    initializeConsul(this.config.serviceDiscovery as ConsulConfig);
  }

  async registerService(params: ServiceDiscoveryConfig): Promise<void> {
    if (this.config.environment === 'development') {
      const consulConfig = params as ConsulConfig;
      await registerConsulService(consulConfig);
      return;
    }

    this.client = createServiceDiscoveryClient(this.config);

    console.log('Registering service in production mode');

    const awsServiceDiscoveryConfig = params as AWSServiceDiscoveryConfig;

    try {
      const command = new RegisterInstanceCommand({
        ServiceId: awsServiceDiscoveryConfig.serviceId,
        InstanceId: `${awsServiceDiscoveryConfig.serviceName}-${Date.now()}`,
        Attributes: {
          "AWS_INSTANCE_IPV4": awsServiceDiscoveryConfig.serviceAddress,
          "AWS_INSTANCE_PORT": awsServiceDiscoveryConfig.servicePort.toString(),
        },
      });

      await this.client!.send(command);
      console.log(`Service ${awsServiceDiscoveryConfig.serviceName} registered with AWS Cloud Map`);
    } catch (error) {
      console.error('Error registering service:', error);
      throw error;
    }
  }

  async discoverService(params: ServiceDiscoveryConfig): Promise<string> {
    if (this.config.environment === 'development') {
      const consulConfig = params as ConsulConfig;
      return `http://${consulConfig.name}:${this.config.service.port}`;
    }

    try {
      const awsServiceDiscoveryConfig = params as AWSServiceDiscoveryConfig;

      const command = new DiscoverInstancesCommand({
        NamespaceName: awsServiceDiscoveryConfig.namespaceId,
        ServiceName: awsServiceDiscoveryConfig.serviceName,
        MaxResults: 1,
      });

      const response = await this.client!.send(command);
      const instance = response.Instances?.[0];

      if (!instance) {
        throw new Error(`No instances found for service ${awsServiceDiscoveryConfig.serviceName}`);
      }

      return `http://${awsServiceDiscoveryConfig.serviceName}.${awsServiceDiscoveryConfig.namespaceId}`;
    } catch (error) {
      console.error('Error discovering service:', error);
      throw error;
    }
  }
} 