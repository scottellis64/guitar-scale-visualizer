import { RegisterInstanceCommand, DiscoverInstancesCommand } from "@aws-sdk/client-servicediscovery";
import { config } from './config';
import { createServiceDiscoveryClient } from './factory';
import { registerService as registerConsulService } from './utils/consul';

const client = createServiceDiscoveryClient();

export const registerService = async (serviceName: string) => {
  if (config.environment === 'development') {

    console.log('Registering service in development mode');

    // In development, use Consul
    await registerConsulService({
      name: serviceName,
      port: config.server.port,
      address: config.server.host,
      tags: ['ffmpeg', 'video-processing'],
      check: {
        http: `http://${config.server.host}:${config.server.port}/api/health`,
        interval: '10s',
        timeout: '5s',
      },
    });
    return;
  }

  console.log('Registering service in production mode');
  try {
    const command = new RegisterInstanceCommand({
      ServiceId: config.aws.serviceId,
      InstanceId: `${serviceName}-${Date.now()}`,
      Attributes: {
        "AWS_INSTANCE_IPV4": config.server.host as string,
        "AWS_INSTANCE_PORT": config.server.port.toString(),
      },
    });

    await client.send(command);
    console.log(`Service ${serviceName} registered with AWS Cloud Map`);
  } catch (error) {
    console.error('Error registering service:', error);
    throw error;
  }
};

export const discoverService = async (serviceName: string) => {
  if (config.environment === 'development') {
    // In development, use Consul
    return `http://${serviceName}:${config.server.port}`;
  }

  try {
    const command = new DiscoverInstancesCommand({
      NamespaceName: config.aws.namespaceId,
      ServiceName: serviceName,
      MaxResults: 1,
    });

    const response = await client.send(command);
    const instance = response.Instances?.[0];

    if (!instance) {
      throw new Error(`No instances found for service ${serviceName}`);
    }

    return `http://${serviceName}.${config.aws.namespaceId}`;
  } catch (error) {
    console.error('Error discovering service:', error);
    throw error;
  }
}; 