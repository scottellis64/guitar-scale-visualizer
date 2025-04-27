import { RegisterInstanceCommand, DiscoverInstancesCommand } from "@aws-sdk/client-servicediscovery";
import { config } from '../config';
import { createServiceDiscoveryClient } from '../factory';
import { registerService as registerConsulService } from '../utils/consul';

export interface ServiceRegistrationParams {
  name: string;
  port: number;
  address: string;
  tags?: string[];
  check?: {
    http: string;
    interval: string;
    timeout: string;
  };
}

export class ServiceDiscoveryService {
  private client;

  constructor() {
    this.client = createServiceDiscoveryClient();
  }

  async registerService(params: ServiceRegistrationParams): Promise<void> {
    if (config.environment === 'development') {
      console.log('Registering service in development mode');
      await registerConsulService(params);
      return;
    }

    console.log('Registering service in production mode');
    try {
      const command = new RegisterInstanceCommand({
        ServiceId: config.aws.serviceId,
        InstanceId: `${params.name}-${Date.now()}`,
        Attributes: {
          "AWS_INSTANCE_IPV4": params.address,
          "AWS_INSTANCE_PORT": params.port.toString(),
        },
      });

      await this.client.send(command);
      console.log(`Service ${params.name} registered with AWS Cloud Map`);
    } catch (error) {
      console.error('Error registering service:', error);
      throw error;
    }
  }

  async discoverService(serviceName: string): Promise<string> {
    if (config.environment === 'development') {
      return `http://${serviceName}:${config.server.port}`;
    }

    try {
      const command = new DiscoverInstancesCommand({
        NamespaceName: config.aws.namespace,
        ServiceName: serviceName,
        MaxResults: 1,
      });

      const response = await this.client.send(command);
      const instance = response.Instances?.[0];

      if (!instance) {
        throw new Error(`No instances found for service ${serviceName}`);
      }

      return `http://${serviceName}.${config.aws.namespace}`;
    } catch (error) {
      console.error('Error discovering service:', error);
      throw error;
    }
  }
} 